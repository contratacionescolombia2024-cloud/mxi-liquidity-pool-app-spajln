
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { notificationService } from '@/utils/notificationService';
import { Platform } from 'react-native';
import { showConfirm, showAlert } from '@/utils/confirmDialog';

interface User {
  id: string;
  name: string;
  idNumber: string;
  address: string;
  email: string;
  emailVerified: boolean;
  mxiBalance: number;
  usdtContributed: number;
  referralCode: string;
  referredBy?: string;
  referrals: {
    level1: number;
    level2: number;
    level3: number;
  };
  commissions: {
    total: number;
    available: number;
    withdrawn: number;
  };
  activeReferrals: number;
  canWithdraw: boolean;
  lastWithdrawalDate?: string;
  joinedDate: string;
  isActiveContributor: boolean;
  yieldRatePerMinute: number;
  lastYieldUpdate: string;
  accumulatedYield: number;
  kycStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  kycVerifiedAt?: string;
  availableMXI?: number;
  nextReleaseDate?: string;
  releasePercentage?: number;
  mxiPurchasedDirectly?: number;
  mxiFromUnifiedCommissions?: number;
  mxiFromChallenges?: number;
}

interface PoolStatus {
  pool_close_date: string;
  mxi_launch_date: string;
  is_pool_closed: boolean;
  is_mxi_launched: boolean;
  days_until_close: number;
  days_until_launch: number;
}

interface PhaseInfo {
  totalTokensSold: number;
  currentPhase: number;
  currentPriceUsdt: number;
  phase1TokensSold: number;
  phase2TokensSold: number;
  phase3TokensSold: number;
  phase1Remaining: number;
  phase2Remaining: number;
  tokensUntilNextPhase: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; userId?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string; userId?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  addContribution: (usdtAmount: number, transactionType: 'initial' | 'increase' | 'reinvestment') => Promise<{ success: boolean; error?: string }>;
  withdrawCommission: (amount: number, walletAddress: string) => Promise<{ success: boolean; error?: string }>;
  withdrawMXI: (amount: number, walletAddress: string) => Promise<{ success: boolean; error?: string }>;
  unifyCommissionToMXI: (amount: number) => Promise<{ success: boolean; mxiAmount?: number; error?: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  checkWithdrawalEligibility: () => Promise<boolean>;
  claimYield: () => Promise<{ success: boolean; yieldEarned?: number; error?: string }>;
  getCurrentYield: () => number;
  getPoolStatus: () => Promise<PoolStatus | null>;
  checkMXIWithdrawalEligibility: () => Promise<boolean>;
  getAvailableMXI: () => Promise<number>;
  checkAdminStatus: () => Promise<boolean>;
  getPhaseInfo: () => Promise<PhaseInfo | null>;
}

interface RegisterData {
  name: string;
  idNumber: string;
  address: string;
  email: string;
  password: string;
  referralCode?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to wait with exponential backoff
const waitWithBackoff = (attempt: number) => {
  const baseDelay = 1000; // 1 second
  const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Helper function to check if profile exists
const checkProfileExists = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    return !error && !!data;
  } catch (error) {
    console.error('Error checking profile:', error);
    return false;
  }
};

// Helper function to create profile manually
const createProfileManually = async (
  userId: string,
  name: string,
  idNumber: string,
  address: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔧 Attempting manual profile creation...');
    
    const { data, error } = await supabase.rpc('create_missing_user_profile', {
      p_user_id: userId,
      p_name: name,
      p_id_number: idNumber,
      p_address: address,
    });

    if (error) {
      console.error('❌ Manual profile creation RPC error:', error);
      return { success: false, error: error.message };
    }

    if (data && data.success) {
      console.log('✅ Manual profile creation successful:', data);
      return { success: true };
    } else {
      console.error('❌ Manual profile creation failed:', data);
      return { success: false, error: data?.error || 'Unknown error' };
    }
  } catch (error: any) {
    console.error('❌ Manual profile creation exception:', error);
    return { success: false, error: error.message };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize notification service (only on native platforms)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      notificationService.initialize();
      
      return () => {
        notificationService.cleanup();
      };
    }
  }, []);

  // Subscribe to real-time updates when user is authenticated
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscriptions for user:', user.id);

    // Subscribe to balance changes (only on native)
    let unsubscribeBalance = () => {};
    let unsubscribeMessages = () => {};
    
    if (Platform.OS !== 'web') {
      unsubscribeBalance = notificationService.subscribeToBalanceChanges(
        user.id,
        (oldBalance, newBalance) => {
          console.log('Balance changed:', { oldBalance, newBalance });
          loadUserData(user.id);
        }
      );

      unsubscribeMessages = notificationService.subscribeToMessages(
        user.id,
        (message) => {
          console.log('New message received:', message);
        }
      );
    }

    // Subscribe to withdrawal status changes
    const withdrawalChannel = supabase
      .channel(`withdrawals-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'withdrawals',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.new?.status === 'approved' && payload.old?.status !== 'approved') {
            if (Platform.OS !== 'web') {
              notificationService.notifyWithdrawalApproved(
                payload.new.amount,
                payload.new.currency
              );
            }
          }
        }
      )
      .subscribe();

    // Subscribe to KYC status changes
    const kycChannel = supabase
      .channel(`kyc-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.new?.kyc_status !== payload.old?.kyc_status) {
            if (Platform.OS !== 'web') {
              notificationService.notifyKYCStatusChange(payload.new.kyc_status);
            }
            loadUserData(user.id);
          }
        }
      )
      .subscribe();

    // Subscribe to commission earnings
    const commissionChannel = supabase
      .channel(`commissions-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'commissions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.new) {
            if (Platform.OS !== 'web') {
              notificationService.notifyReferralCommission(
                payload.new.amount,
                payload.new.level || 1,
                'Your Referral'
              );
            }
            loadUserData(user.id);
          }
        }
      )
      .subscribe();

    return () => {
      unsubscribeBalance();
      unsubscribeMessages();
      supabase.removeChannel(withdrawalChannel);
      supabase.removeChannel(kycChannel);
      supabase.removeChannel(commissionChannel);
    };
  }, [user?.id]);

  useEffect(() => {
    console.log('=== AUTH CONTEXT INITIALIZATION ===');
    console.log('Platform:', Platform.OS);
    console.log('Supabase client available:', !!supabase);
    
    // Increased timeout to 15 seconds for better reliability
    const loadingTimeout = setTimeout(() => {
      console.warn('⚠️ Auth initialization timeout (15s) - forcing loading to false');
      if (loading) {
        setLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        setSession(null);
      }
    }, 15000);

    const initializeAuth = async () => {
      try {
        console.log('🔄 Starting auth session check...');
        
        // Create a promise that rejects after 10 seconds
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session check timeout')), 10000);
        });

        // Race between getting session and timeout
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]) as { data: { session: Session | null }, error: any };

        clearTimeout(loadingTimeout);
        
        if (sessionResult.error) {
          console.error('❌ Error getting initial session:', sessionResult.error);
          setLoading(false);
          return;
        }
        
        console.log('✅ Initial session:', sessionResult.data.session ? 'Found' : 'Not found');
        setSession(sessionResult.data.session);
        
        if (sessionResult.data.session) {
          console.log('📥 Loading user data for session user:', sessionResult.data.session.user.id);
          await loadUserData(sessionResult.data.session.user.id);
        } else {
          console.log('ℹ️ No session found, setting loading to false');
          setLoading(false);
        }
      } catch (error) {
        clearTimeout(loadingTimeout);
        console.error('❌ Exception during auth initialization:', error);
        setLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        setSession(null);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('=== AUTH STATE CHANGE ===');
      console.log('Event:', _event);
      console.log('Session:', session ? 'Present' : 'Null');
      
      setSession(session);
      
      if (_event === 'SIGNED_OUT') {
        console.log('User signed out, clearing state');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      if (_event === 'SIGNED_IN' && session) {
        console.log('User signed in, syncing email verification status');
        try {
          // Sync email verification status from auth.users to users table
          if (session.user.email_confirmed_at) {
            await supabase
              .from('users')
              .update({ email_verified: true })
              .eq('id', session.user.id);
          }
          
          await loadUserData(session.user.id);
        } catch (error) {
          console.error('Error in SIGNED_IN handler:', error);
          setLoading(false);
        }
      } else if (session) {
        console.log('Session present, loading user data');
        await loadUserData(session.user.id);
      } else {
        console.log('No session, clearing user state');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      console.log('=== LOADING USER DATA ===');
      console.log('User ID:', userId);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        console.error('Error loading user data:', userError);
        setLoading(false);
        return;
      }

      if (!userData) {
        console.log('No user data found');
        setLoading(false);
        return;
      }

      console.log('User data loaded:', userData.email);
      console.log('Email verified status:', userData.email_verified);

      const { data: referralData } = await supabase
        .from('referrals')
        .select('level')
        .eq('referrer_id', userId);

      const referrals = {
        level1: referralData?.filter(r => r.level === 1).length || 0,
        level2: referralData?.filter(r => r.level === 2).length || 0,
        level3: referralData?.filter(r => r.level === 3).length || 0,
      };

      const { data: commissionData } = await supabase
        .from('commissions')
        .select('amount, status')
        .eq('user_id', userId);

      const commissions = {
        total: commissionData?.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0,
        available: commissionData?.filter(c => c.status === 'available').reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0,
        withdrawn: commissionData?.filter(c => c.status === 'withdrawn').reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0,
      };

      // Get MXI withdrawal schedule
      const { data: scheduleData } = await supabase
        .from('mxi_withdrawal_schedule')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const mappedUser: User = {
        id: userData.id,
        name: userData.name,
        idNumber: userData.id_number,
        address: userData.address,
        email: userData.email,
        emailVerified: userData.email_verified || false,
        mxiBalance: parseFloat(userData.mxi_balance.toString()),
        usdtContributed: parseFloat(userData.usdt_contributed.toString()),
        referralCode: userData.referral_code,
        referredBy: userData.referred_by,
        referrals,
        commissions,
        activeReferrals: userData.active_referrals,
        canWithdraw: userData.can_withdraw,
        lastWithdrawalDate: userData.last_withdrawal_date,
        joinedDate: userData.joined_date,
        isActiveContributor: userData.is_active_contributor || false,
        yieldRatePerMinute: parseFloat(userData.yield_rate_per_minute?.toString() || '0'),
        lastYieldUpdate: userData.last_yield_update || new Date().toISOString(),
        accumulatedYield: parseFloat(userData.accumulated_yield?.toString() || '0'),
        kycStatus: userData.kyc_status || 'not_submitted',
        kycVerifiedAt: userData.kyc_verified_at,
        availableMXI: scheduleData ? parseFloat(scheduleData.released_mxi?.toString() || '0') : 0,
        nextReleaseDate: scheduleData?.next_release_date,
        releasePercentage: scheduleData ? parseFloat(scheduleData.release_percentage?.toString() || '10') : 10,
        mxiPurchasedDirectly: parseFloat(userData.mxi_purchased_directly?.toString() || '0'),
        mxiFromUnifiedCommissions: parseFloat(userData.mxi_from_unified_commissions?.toString() || '0'),
        mxiFromChallenges: parseFloat(userData.mxi_from_challenges?.toString() || '0'),
      };

      console.log('User data loaded successfully');
      console.log('MXI Breakdown:', {
        purchased: mappedUser.mxiPurchasedDirectly,
        commissions: mappedUser.mxiFromUnifiedCommissions,
        challenges: mappedUser.mxiFromChallenges,
        vesting: mappedUser.accumulatedYield,
        total: (mappedUser.mxiPurchasedDirectly || 0) + (mappedUser.mxiFromUnifiedCommissions || 0) + (mappedUser.mxiFromChallenges || 0) + mappedUser.accumulatedYield
      });
      
      setUser(mappedUser);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('Error in loadUserData:', error);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; userId?: string }> => {
    try {
      console.log('=== LOGIN FUNCTION START ===');
      console.log('Attempting login for:', email);
      console.log('Platform:', Platform.OS);
      console.log('Timestamp:', new Date().toISOString());
      
      const trimmedEmail = email.trim().toLowerCase();
      
      // Attempt to sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        console.error('=== SUPABASE AUTH ERROR ===');
        console.error('Error object:', JSON.stringify(error, null, 2));
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error name:', error.name);
        
        // DRASTIC FIX: Check the error message FIRST to distinguish between error types
        const errorMsg = error.message.toLowerCase();
        
        // Priority 1: Check for "Invalid login credentials" - This means WRONG PASSWORD OR EMAIL
        if (
          errorMsg.includes('invalid login credentials') ||
          errorMsg.includes('invalid credentials')
        ) {
          console.log('✅ DETECTED: Invalid credentials (wrong email or password)');
          return { 
            success: false, 
            error: 'Correo electrónico o contraseña incorrectos. Por favor verifica tus credenciales e intenta de nuevo.' 
          };
        }
        
        // Priority 2: Check for "Email not confirmed" - This means credentials are CORRECT but email not verified
        if (
          errorMsg.includes('email not confirmed') ||
          errorMsg.includes('email confirmation')
        ) {
          console.log('✅ DETECTED: Email not confirmed (credentials were correct)');
          
          // Get the user ID from the database
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('email', trimmedEmail)
            .maybeSingle();
          
          return { 
            success: false,
            userId: userData?.id,
            error: 'Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada (y carpeta de spam) para el enlace de verificación.' 
          };
        }
        
        // Priority 3: Check for rate limiting
        if (error.status === 429 || errorMsg.includes('rate limit')) {
          console.log('✅ DETECTED: Rate limit error');
          return { 
            success: false, 
            error: 'Demasiados intentos de inicio de sesión. Por favor espera unos minutos e intenta de nuevo.' 
          };
        }
        
        // Generic error fallback
        console.log('⚠️ UNHANDLED ERROR TYPE:', error.message);
        return { success: false, error: error.message };
      }

      if (!data.session) {
        console.error('❌ No session created after login');
        return { success: false, error: 'No se pudo crear la sesión' };
      }

      console.log('✅ Auth login successful');
      console.log('User ID:', data.user.id);
      console.log('Email confirmed at:', data.user.email_confirmed_at);
      
      // Sync email verification status after successful login
      if (data.user.email_confirmed_at) {
        console.log('Syncing email verification status to users table');
        await supabase
          .from('users')
          .update({ email_verified: true })
          .eq('id', data.user.id);
      }
      
      console.log('=== LOGIN FUNCTION END (SUCCESS) ===');
      console.log('Timestamp:', new Date().toISOString());
      return { success: true, userId: data.user.id };
    } catch (error: any) {
      console.error('=== LOGIN EXCEPTION ===');
      console.error('Exception:', error);
      console.error('Exception message:', error.message);
      console.error('Exception stack:', error.stack);
      return { success: false, error: error.message || 'Error al iniciar sesión' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string; userId?: string }> => {
    try {
      console.log('=== REGISTRATION START ===');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Attempting registration for:', userData.email);
      console.log('User data:', { 
        name: userData.name, 
        idNumber: userData.idNumber, 
        address: userData.address,
        hasReferralCode: !!userData.referralCode 
      });

      // Step 1: Client-side validation
      console.log('Step 1: Performing client-side validation...');
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        console.log('❌ Invalid email format');
        return { success: false, error: 'El formato del correo electrónico no es válido. Por favor verifica e intenta de nuevo.' };
      }

      // Validate password length
      if (userData.password.length < 6) {
        console.log('❌ Password too short');
        return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
      }

      // Validate name (at least 2 words)
      const nameParts = userData.name.trim().split(' ').filter(part => part.length > 0);
      if (nameParts.length < 2) {
        console.log('❌ Name incomplete');
        return { success: false, error: 'Por favor ingresa tu nombre completo (nombre y apellido).' };
      }

      // Validate ID number (at least 5 characters)
      if (userData.idNumber.trim().length < 5) {
        console.log('❌ ID number too short');
        return { success: false, error: 'El número de identificación debe tener al menos 5 caracteres.' };
      }

      // Validate address (at least 10 characters)
      if (userData.address.trim().length < 10) {
        console.log('❌ Address too short');
        return { success: false, error: 'Por favor ingresa una dirección completa (mínimo 10 caracteres).' };
      }

      // Step 2: Validate existing email
      console.log('Step 2: Checking for existing email...');
      const { data: existingUser, error: emailCheckError } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email.trim().toLowerCase())
        .maybeSingle();

      if (emailCheckError) {
        console.error('Error checking existing email:', emailCheckError);
      }

      if (existingUser) {
        console.log('❌ Email already exists');
        return { success: false, error: 'El correo electrónico ya está registrado. Por favor usa otro correo o intenta iniciar sesión.' };
      }

      // Step 3: Validate existing ID number
      console.log('Step 3: Checking for existing ID number...');
      const { data: existingId, error: idCheckError } = await supabase
        .from('users')
        .select('id_number')
        .eq('id_number', userData.idNumber)
        .not('id_number', 'like', 'TEMP_%')
        .maybeSingle();

      if (idCheckError) {
        console.error('Error checking existing ID:', idCheckError);
      }

      if (existingId) {
        console.log('❌ ID number already exists');
        return { success: false, error: 'El número de identificación ya está registrado. Solo se permite una cuenta por persona.' };
      }

      // Step 4: Find referrer if referral code provided
      let referrerId: string | null = null;
      if (userData.referralCode) {
        console.log('Step 4: Looking up referrer with code:', userData.referralCode);
        const { data: referrerData, error: referrerError } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', userData.referralCode.toUpperCase())
          .maybeSingle();

        if (referrerError) {
          console.error('Error finding referrer:', referrerError);
        }

        if (referrerData) {
          referrerId = referrerData.id;
          console.log('✅ Found referrer:', referrerId);
        } else {
          console.log('⚠️ Referral code not found, proceeding without referrer');
        }
      }

      // Step 5: Create auth user
      console.log('Step 5: Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            name: userData.name.trim(),
            id_number: userData.idNumber.trim(),
            address: userData.address.trim(),
          },
        },
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        console.error('Error code:', authError.status);
        console.error('Error name:', authError.name);
        
        // Handle rate limiting
        if (authError.message.includes('429') || authError.message.toLowerCase().includes('rate limit')) {
          return { 
            success: false, 
            error: 'Demasiados intentos de registro. Por favor espera unos minutos e intenta de nuevo.' 
          };
        }
        
        // Handle user already registered
        if (authError.message.toLowerCase().includes('already registered') || authError.message.toLowerCase().includes('user already registered')) {
          return {
            success: false,
            error: 'Este correo electrónico ya está registrado. Por favor intenta iniciar sesión o usa otro correo.'
          };
        }

        // Handle invalid email
        if (authError.message.toLowerCase().includes('invalid') && authError.message.toLowerCase().includes('email')) {
          return {
            success: false,
            error: 'El formato del correo electrónico no es válido. Por favor verifica e intenta de nuevo.'
          };
        }

        // Handle weak password
        if (authError.message.toLowerCase().includes('password') && (authError.message.toLowerCase().includes('weak') || authError.message.toLowerCase().includes('short'))) {
          return {
            success: false,
            error: 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.'
          };
        }
        
        // Generic auth error
        return { success: false, error: 'Error al crear la cuenta: ' + authError.message };
      }

      if (!authData.user) {
        console.error('❌ No user returned from signup');
        return { success: false, error: 'Error al crear usuario en el sistema de autenticación. Por favor intenta de nuevo.' };
      }

      console.log('✅ Auth user created successfully:', authData.user.id);

      // Step 6: Wait for trigger and verify profile creation with aggressive retries
      console.log('Step 6: Waiting for database trigger to create profile...');
      let profileCreated = false;
      let profileData = null;
      const maxRetries = 10; // Increased from 5 to 10
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        console.log(`Profile check attempt ${attempt + 1}/${maxRetries}...`);
        
        // Wait with exponential backoff
        if (attempt > 0) {
          await waitWithBackoff(attempt - 1);
        } else {
          // First check after 500ms
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const profileExists = await checkProfileExists(authData.user.id);
        
        if (profileExists) {
          const { data: checkData, error: checkError } = await supabase
            .from('users')
            .select('id, name, email, referral_code, id_number')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (!checkError && checkData) {
            profileData = checkData;
            profileCreated = true;
            console.log('✅ Profile found:', checkData);
            break;
          }
        }
      }

      // Step 7: Create profile manually if trigger failed
      if (!profileCreated) {
        console.log('⚠️ Profile not created by trigger after retries, creating manually...');
        
        const manualResult = await createProfileManually(
          authData.user.id,
          userData.name.trim(),
          userData.idNumber.trim(),
          userData.address.trim()
        );

        if (!manualResult.success) {
          console.error('❌ Manual profile creation failed:', manualResult.error);
          
          // Log the failure for admin review
          try {
            await supabase
              .from('user_creation_logs')
              .insert({
                user_id: authData.user.id,
                event_type: 'manual_creation_failed',
                success: false,
                error_message: manualResult.error,
                metadata: {
                  email: userData.email,
                  name: userData.name,
                  timestamp: new Date().toISOString()
                }
              });
          } catch (logError) {
            console.error('Failed to log error:', logError);
          }
          
          return {
            success: false,
            error: 'No se pudo crear el perfil de usuario después de múltiples intentos. Por favor contacta a soporte con tu correo electrónico: ' + userData.email
          };
        }
        
        console.log('✅ Profile created manually');
        profileCreated = true;
      }

      // Step 8: Update profile with referrer if applicable
      if (referrerId && profileCreated) {
        console.log('Step 8: Updating profile with referrer...');
        const { error: updateError } = await supabase
          .from('users')
          .update({
            referred_by: referrerId,
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('⚠️ Profile update error:', updateError);
          // Don't fail registration if update fails
        } else {
          console.log('✅ Profile updated with referrer');
        }
      }

      // Step 9: Create referral chain if applicable
      if (referrerId) {
        console.log('Step 9: Creating referral chain...');
        try {
          await createReferralChain(authData.user.id, referrerId);
          console.log('✅ Referral chain created');
        } catch (referralError) {
          console.error('⚠️ Referral chain creation error:', referralError);
          // Don't fail registration if referral chain fails
        }
      }

      // Step 10: Final verification with retries
      console.log('Step 10: Performing final verification...');
      let finalCheck = null;
      const finalMaxRetries = 5;
      
      for (let attempt = 0; attempt < finalMaxRetries; attempt++) {
        console.log(`Final verification attempt ${attempt + 1}/${finalMaxRetries}...`);
        
        if (attempt > 0) {
          await waitWithBackoff(attempt - 1);
        }
        
        const { data, error: finalCheckError } = await supabase
          .from('users')
          .select('id, name, email, referral_code, id_number')
          .eq('id', authData.user.id)
          .maybeSingle();
        
        if (finalCheckError) {
          console.error(`Final verification error (attempt ${attempt + 1}):`, finalCheckError);
          continue;
        }
        
        if (data && data.name && data.email && data.referral_code && data.id_number) {
          finalCheck = data;
          console.log('✅ Final verification successful:', data);
          break;
        }
      }

      if (!finalCheck) {
        console.error('❌ Final verification failed after all retries');
        return {
          success: false,
          error: 'El usuario fue creado pero no se pudo verificar completamente. Por favor intenta iniciar sesión. Si el problema persiste, contacta a soporte con tu correo: ' + userData.email
        };
      }

      console.log('=== REGISTRATION SUCCESSFUL ===');
      console.log('User ID:', authData.user.id);
      console.log('Email:', userData.email);
      console.log('Referral Code:', finalCheck.referral_code);
      console.log('Timestamp:', new Date().toISOString());
      
      return { success: true, userId: authData.user.id };
    } catch (error: any) {
      console.error('=== REGISTRATION EXCEPTION ===');
      console.error('Registration exception:', error);
      console.error('Error stack:', error.stack);
      
      // Handle specific errors
      if (error.message && error.message.includes('429')) {
        return { 
          success: false, 
          error: 'Demasiados intentos de registro. Por favor espera unos minutos e intenta de nuevo.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Ocurrió un error inesperado durante el registro. Por favor intenta de nuevo o contacta a soporte si el problema persiste. Error: ' + (error.message || 'Desconocido')
      };
    }
  };

  const createReferralChain = async (newUserId: string, directReferrerId: string) => {
    try {
      console.log('Creating level 1 referral');
      await supabase.from('referrals').insert({
        referrer_id: directReferrerId,
        referred_id: newUserId,
        level: 1,
      });

      const { data: level2Data } = await supabase
        .from('users')
        .select('referred_by')
        .eq('id', directReferrerId)
        .maybeSingle();

      if (level2Data?.referred_by) {
        console.log('Creating level 2 referral');
        await supabase.from('referrals').insert({
          referrer_id: level2Data.referred_by,
          referred_id: newUserId,
          level: 2,
        });

        const { data: level3Data } = await supabase
          .from('users')
          .select('referred_by')
          .eq('id', level2Data.referred_by)
          .maybeSingle();

        if (level3Data?.referred_by) {
          console.log('Creating level 3 referral');
          await supabase.from('referrals').insert({
            referrer_id: level3Data.referred_by,
            referred_id: newUserId,
            level: 3,
          });
        }
      }
      console.log('Referral chain created successfully');
    } catch (error) {
      console.error('Error creating referral chain:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Show confirmation dialog before logging out
    showConfirm({
      title: '¿Cerrar Sesión?',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      confirmText: 'Cerrar Sesión',
      cancelText: 'Cancelar',
      type: 'warning',
      icon: {
        ios: 'rectangle.portrait.and.arrow.right',
        android: 'logout',
      },
      onConfirm: async () => {
        try {
          console.log('=== LOGOUT START ===');
          console.log('Current session:', session?.user?.id);
          console.log('Current user:', user?.id);
          
          // Sign out from Supabase FIRST
          const { error } = await supabase.auth.signOut({ scope: 'local' });
          
          if (error) {
            console.error('Supabase signOut error:', error);
            // Continue anyway to clear local state
          } else {
            console.log('Supabase signOut successful');
          }
          
          // Then clear local state - this will trigger the navigation in _layout.tsx
          setUser(null);
          setSession(null);
          setIsAuthenticated(false);
          
          console.log('Local state cleared');
          console.log('=== LOGOUT COMPLETE ===');
        } catch (error) {
          console.error('=== LOGOUT EXCEPTION ===');
          console.error('Logout error:', error);
          
          // Ensure state is cleared even on error
          setUser(null);
          setSession(null);
          setIsAuthenticated(false);
        }
      },
      onCancel: () => {
        console.log('Logout cancelled');
      },
    });
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const dbUpdates: any = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.idNumber) dbUpdates.id_number = updates.idNumber;
      if (updates.address) dbUpdates.address = updates.address;
      if (updates.mxiBalance !== undefined) dbUpdates.mxi_balance = updates.mxiBalance;
      if (updates.usdtContributed !== undefined) dbUpdates.usdt_contributed = updates.usdtContributed;
      if (updates.activeReferrals !== undefined) dbUpdates.active_referrals = updates.activeReferrals;
      if (updates.canWithdraw !== undefined) dbUpdates.can_withdraw = updates.canWithdraw;
      if (updates.lastWithdrawalDate) dbUpdates.last_withdrawal_date = updates.lastWithdrawalDate;
      if (updates.isActiveContributor !== undefined) dbUpdates.is_active_contributor = updates.isActiveContributor;
      if (updates.kycStatus) dbUpdates.kyc_status = updates.kycStatus;

      const { error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', user.id);

      if (error) {
        console.error('Update user error:', error);
        return;
      }

      setUser({ ...user, ...updates });
    } catch (error) {
      console.error('Update user exception:', error);
    }
  };

  const addContribution = async (
    usdtAmount: number,
    transactionType: 'initial' | 'increase' | 'reinvestment'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      // Get current phase info to determine price
      const { data: phaseData, error: phaseError } = await supabase.rpc('get_phase_info');

      if (phaseError) {
        console.error('Phase info error:', phaseError);
        return { success: false, error: 'Failed to get current pricing' };
      }

      const currentPrice = phaseData?.[0]?.current_price_usdt || 0.30;
      const mxiTokens = usdtAmount / currentPrice;

      const { error: contributionError } = await supabase
        .from('contributions')
        .insert({
          user_id: user.id,
          usdt_amount: usdtAmount,
          mxi_amount: mxiTokens,
          transaction_type: transactionType,
          status: 'completed',
        });

      if (contributionError) {
        console.error('Contribution error:', contributionError);
        return { success: false, error: 'Failed to record contribution' };
      }

      const newMxiBalance = user.mxiBalance + mxiTokens;
      const newUsdtContributed = user.usdtContributed + usdtAmount;
      const newMxiPurchasedDirectly = (user.mxiPurchasedDirectly || 0) + mxiTokens;

      const { error: updateError } = await supabase
        .from('users')
        .update({
          mxi_balance: newMxiBalance,
          usdt_contributed: newUsdtContributed,
          mxi_purchased_directly: newMxiPurchasedDirectly,
          is_active_contributor: true,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update balance error:', updateError);
        return { success: false, error: 'Failed to update balance' };
      }

      // Update token sales tracking
      await supabase.rpc('update_token_sales', { p_tokens_sold: mxiTokens });

      await supabase.rpc('process_referral_commissions', {
        p_user_id: user.id,
        p_contribution_amount: usdtAmount,
      });

      if (user.referredBy && transactionType === 'initial') {
        await supabase.rpc('increment_active_referrals', {
          p_user_id: user.referredBy,
        });
      }

      // Notify about payment confirmation (only on native)
      if (Platform.OS !== 'web') {
        await notificationService.notifyPaymentConfirmed(usdtAmount, mxiTokens);
      }

      await loadUserData(user.id);

      return { success: true };
    } catch (error: any) {
      console.error('Add contribution exception:', error);
      return { success: false, error: error.message || 'Failed to add contribution' };
    }
  };

  const withdrawCommission = async (
    amount: number,
    walletAddress: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    // Check KYC status
    if (user.kycStatus !== 'approved') {
      return { 
        success: false, 
        error: 'KYC verification required. Please complete KYC verification before withdrawing.' 
      };
    }

    if (!user.canWithdraw) {
      return { success: false, error: 'Withdrawal not available. You need 5 active referrals and 10 days since joining.' };
    }

    if (amount > user.commissions.available) {
      return { success: false, error: 'Insufficient available commission' };
    }

    try {
      const { error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount,
          currency: 'USDT',
          wallet_address: walletAddress,
          status: 'pending',
        });

      if (withdrawalError) {
        console.error('Withdrawal error:', withdrawalError);
        return { success: false, error: 'Failed to create withdrawal request' };
      }

      const { error: commissionError } = await supabase
        .from('commissions')
        .update({ status: 'withdrawn' })
        .eq('user_id', user.id)
        .eq('status', 'available')
        .lte('amount', amount);

      if (commissionError) {
        console.error('Commission update error:', commissionError);
        return { success: false, error: 'Failed to update commission status' };
      }

      await updateUser({ lastWithdrawalDate: new Date().toISOString() });
      await loadUserData(user.id);

      return { success: true };
    } catch (error: any) {
      console.error('Withdraw commission exception:', error);
      return { success: false, error: error.message || 'Withdrawal failed' };
    }
  };

  const unifyCommissionToMXI = async (
    amount: number
  ): Promise<{ success: boolean; mxiAmount?: number; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    if (amount > user.commissions.available) {
      return { success: false, error: 'Insufficient available commission' };
    }

    if (amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' };
    }

    try {
      const { data, error } = await supabase.rpc('unify_commission_to_mxi', {
        p_user_id: user.id,
        p_amount: amount,
      });

      if (error) {
        console.error('Unify commission error:', error);
        return { success: false, error: error.message || 'Failed to unify commission' };
      }

      if (!data || !data.success) {
        return { success: false, error: data?.error || 'Failed to unify commission' };
      }

      await loadUserData(user.id);

      return { 
        success: true, 
        mxiAmount: parseFloat(data.mxi_amount?.toString() || '0')
      };
    } catch (error: any) {
      console.error('Unify commission exception:', error);
      return { success: false, error: error.message || 'Failed to unify commission' };
    }
  };

  const withdrawMXI = async (
    amount: number,
    walletAddress: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    // Check KYC status
    if (user.kycStatus !== 'approved') {
      return { 
        success: false, 
        error: 'KYC verification required. Please complete KYC verification before withdrawing.' 
      };
    }

    try {
      // Check available MXI from phased release
      const availableMXI = await getAvailableMXI();

      if (availableMXI === 0) {
        return { 
          success: false, 
          error: 'No MXI available for withdrawal yet. Please wait for the next release cycle.' 
        };
      }

      if (amount > availableMXI) {
        return { 
          success: false, 
          error: `You can only withdraw up to ${availableMXI.toFixed(2)} MXI at this time. The remaining balance will be released in weekly cycles.` 
        };
      }

      // Check basic eligibility
      const { data: canWithdrawMXI, error: eligibilityError } = await supabase
        .rpc('check_mxi_withdrawal_eligibility', { p_user_id: user.id });

      if (eligibilityError) {
        console.error('MXI eligibility check error:', eligibilityError);
        return { success: false, error: 'Failed to check withdrawal eligibility' };
      }

      if (!canWithdrawMXI) {
        if (user.activeReferrals < 5) {
          return { 
            success: false, 
            error: `You need 5 active referrals to withdraw mined MXI. You currently have ${user.activeReferrals} active referrals.` 
          };
        }

        const { data: poolStatus } = await supabase.rpc('get_pool_status');
        const status = poolStatus?.[0];

        if (status && !status.is_mxi_launched) {
          const daysUntil = status.days_until_launch;
          return { 
            success: false, 
            error: `MXI withdrawals will be available in ${daysUntil} days after the pool closes.` 
          };
        }

        return { success: false, error: 'MXI withdrawals are not yet available' };
      }

      // Create withdrawal request
      const { error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount,
          currency: 'MXI',
          wallet_address: walletAddress,
          status: 'pending',
        });

      if (withdrawalError) {
        console.error('MXI withdrawal error:', withdrawalError);
        return { success: false, error: 'Failed to create withdrawal request' };
      }

      // Update withdrawal schedule
      const { error: scheduleError } = await supabase
        .from('mxi_withdrawal_schedule')
        .update({
          released_mxi: user.availableMXI! - amount,
        })
        .eq('user_id', user.id);

      if (scheduleError) {
        console.error('Schedule update error:', scheduleError);
      }

      await loadUserData(user.id);

      return { success: true };
    } catch (error: any) {
      console.error('Withdraw MXI exception:', error);
      return { success: false, error: error.message || 'Withdrawal failed' };
    }
  };

  const getAvailableMXI = async (): Promise<number> => {
    if (!user) return 0;

    try {
      const { data, error } = await supabase
        .rpc('get_available_mxi_for_withdrawal', { p_user_id: user.id });

      if (error) {
        console.error('Error getting available MXI:', error);
        return 0;
      }

      return parseFloat(data?.toString() || '0');
    } catch (error) {
      console.error('Exception getting available MXI:', error);
      return 0;
    }
  };

  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('=== RESEND VERIFICATION EMAIL ===');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Resending verification email to:', email);
      
      if (!email) {
        console.error('No email provided');
        return { success: false, error: 'No se proporcionó un correo electrónico.' };
      }
      
      const trimmedEmail = email.trim().toLowerCase();
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: trimmedEmail,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
        },
      });

      if (error) {
        console.error('Resend error:', error);
        
        // Handle rate limiting
        if (error.message.includes('429') || error.message.toLowerCase().includes('rate limit')) {
          return {
            success: false,
            error: 'Has solicitado demasiados correos de verificación. Por favor espera unos minutos e intenta de nuevo.'
          };
        }
        
        return { success: false, error: error.message };
      }

      console.log('✅ Verification email sent successfully');
      console.log('Timestamp:', new Date().toISOString());
      return { success: true };
    } catch (error: any) {
      console.error('Resend exception:', error);
      return { success: false, error: error.message || 'Error al reenviar el email' };
    }
  };

  const checkWithdrawalEligibility = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('check_withdrawal_eligibility_with_kyc', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Check eligibility error:', error);
        return false;
      }

      if (data && !user.canWithdraw) {
        await loadUserData(user.id);
      }

      return data || false;
    } catch (error) {
      console.error('Check eligibility exception:', error);
      return false;
    }
  };

  const claimYield = async (): Promise<{ success: boolean; yieldEarned?: number; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase.rpc('claim_yield', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Claim yield error:', error);
        return { success: false, error: error.message };
      }

      await loadUserData(user.id);

      return { success: true, yieldEarned: parseFloat(data?.toString() || '0') };
    } catch (error: any) {
      console.error('Claim yield exception:', error);
      return { success: false, error: error.message || 'Failed to claim yield' };
    }
  };

  const getCurrentYield = (): number => {
    if (!user || user.yieldRatePerMinute === 0) return 0;

    const lastUpdate = new Date(user.lastYieldUpdate);
    const now = new Date();
    const minutesElapsed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    
    return user.yieldRatePerMinute * minutesElapsed;
  };

  const getPoolStatus = async (): Promise<PoolStatus | null> => {
    try {
      const { data, error } = await supabase.rpc('get_pool_status');

      if (error) {
        console.error('Get pool status error:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Get pool status exception:', error);
      return null;
    }
  };

  const checkMXIWithdrawalEligibility = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('check_mxi_withdrawal_eligibility', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Check MXI eligibility error:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Check MXI eligibility exception:', error);
      return false;
    }
  };

  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('Checking admin status for user:', user.id, user.email);
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Admin check error:', error);
        return false;
      }

      console.log('Admin check result:', data);
      return !!data;
    } catch (error) {
      console.error('Admin check exception:', error);
      return false;
    }
  };

  const getPhaseInfo = async (): Promise<PhaseInfo | null> => {
    try {
      const { data, error } = await supabase.rpc('get_phase_info');

      if (error) {
        console.error('Get phase info error:', error);
        return null;
      }

      const phaseData = data?.[0];
      if (!phaseData) return null;

      return {
        totalTokensSold: parseFloat(phaseData.total_tokens_sold?.toString() || '0'),
        currentPhase: phaseData.current_phase || 1,
        currentPriceUsdt: parseFloat(phaseData.current_price_usdt?.toString() || '0'),
        phase1TokensSold: parseFloat(phaseData.phase_1_tokens_sold?.toString() || '0'),
        phase2TokensSold: parseFloat(phaseData.phase_2_tokens_sold?.toString() || '0'),
        phase3TokensSold: parseFloat(phaseData.phase_3_tokens_sold?.toString() || '0'),
        phase1Remaining: parseFloat(phaseData.phase_1_remaining?.toString() || '0'),
        phase2Remaining: parseFloat(phaseData.phase_2_remaining?.toString() || '0'),
        tokensUntilNextPhase: parseFloat(phaseData.tokens_until_next_phase?.toString() || '0'),
      };
    } catch (error) {
      console.error('Get phase info exception:', error);
      return null;
    }
  };

  const refreshUser = async () => {
    if (user?.id) {
      await loadUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
        addContribution,
        withdrawCommission,
        withdrawMXI,
        unifyCommissionToMXI,
        resendVerificationEmail,
        checkWithdrawalEligibility,
        claimYield,
        getCurrentYield,
        getPoolStatus,
        checkMXIWithdrawalEligibility,
        getAvailableMXI,
        checkAdminStatus,
        getPhaseInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
