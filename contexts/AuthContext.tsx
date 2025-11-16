
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSegments } from 'expo-router';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

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
  availableMXI?: number;
  nextReleaseDate?: string;
  releasePercentage?: number;
  mxiPurchasedDirectly?: number;
  mxiFromUnifiedCommissions?: number;
  mxiFromChallenges?: number;
  mxiVestingLocked?: number;
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addContribution: (usdtAmount: number, transactionType: 'initial' | 'increase' | 'reinvestment') => Promise<{ success: boolean; error?: string }>;
  unifyCommissionToMXI: (amount: number) => Promise<{ success: boolean; mxiAmount?: number; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  claimYield: () => Promise<{ success: boolean; yieldEarned?: number; error?: string }>;
  getCurrentYield: () => number;
  getTotalMxiBalance: () => number;
  getPoolStatus: () => Promise<PoolStatus | null>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const initializationTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInitializing = useRef(false);
  const authSubscription = useRef<any>(null);
  const loadingUserData = useRef(false);

  useEffect(() => {
    console.log('=== AUTH PROVIDER INITIALIZING ===');
    
    // Set a maximum initialization time of 5 seconds
    initializationTimeout.current = setTimeout(() => {
      if (loading) {
        console.warn('Auth initialization timeout - continuing without session');
        setLoading(false);
      }
    }, 5000);

    // Initialize session
    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('=== AUTH STATE CHANGE ===', event);
      
      try {
        if (event === 'SIGNED_OUT') {
          console.log('User signed out - clearing all state');
          clearAuthState();
          return;
        }
        
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in - loading user data');
          setSession(session);
          await loadUserData(session.user.id);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed - updating session');
          setSession(session);
        } else if (session) {
          setSession(session);
          await loadUserData(session.user.id);
        } else {
          clearAuthState();
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        // Don't clear auth state on error - just log it
      }
    });

    authSubscription.current = subscription;

    return () => {
      console.log('Cleaning up auth subscription');
      if (initializationTimeout.current) {
        clearTimeout(initializationTimeout.current);
      }
      if (authSubscription.current) {
        authSubscription.current.unsubscribe();
      }
    };
  }, []);

  const initializeAuth = async () => {
    // Prevent multiple simultaneous initializations
    if (isInitializing.current) {
      console.log('Auth initialization already in progress');
      return;
    }

    isInitializing.current = true;

    try {
      console.log('=== INITIALIZING AUTH ===');
      
      // Get session with timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<{ data: { session: null }, error: Error }>((_, reject) => {
        setTimeout(() => reject(new Error('Session check timeout')), 3000);
      });

      const result = await Promise.race([sessionPromise, timeoutPromise]);
      
      if ('error' in result && result.error) {
        console.error('Error getting session:', result.error);
        clearAuthState();
        return;
      }

      const { data: { session } } = result as { data: { session: Session | null } };

      if (session) {
        console.log('Session found:', session.user.id);
        setSession(session);
        await loadUserData(session.user.id);
      } else {
        console.log('No session found');
        clearAuthState();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      clearAuthState();
    } finally {
      isInitializing.current = false;
    }
  };

  const clearAuthState = () => {
    console.log('=== CLEARING AUTH STATE ===');
    setUser(null);
    setSession(null);
    setIsAuthenticated(false);
    setLoading(false);
    loadingUserData.current = false;
  };

  const loadUserData = async (userId: string) => {
    // Prevent multiple simultaneous loads
    if (loadingUserData.current) {
      console.log('User data already loading, skipping...');
      return;
    }

    loadingUserData.current = true;

    try {
      console.log('=== LOADING USER DATA ===', userId);
      
      // Load user data with timeout
      const userDataPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) => {
        setTimeout(() => reject(new Error('User data loading timeout')), 3000);
      });

      const result = await Promise.race([userDataPromise, timeoutPromise]);

      if ('error' in result && result.error) {
        console.error('Error loading user data:', result.error);
        setLoading(false);
        loadingUserData.current = false;
        return;
      }

      const { data: userData } = result as { data: any };

      if (!userData) {
        console.log('No user data found');
        setLoading(false);
        loadingUserData.current = false;
        return;
      }

      // Load additional data in parallel with timeout
      const [referralResult, commissionResult, scheduleResult] = await Promise.allSettled([
        Promise.race([
          supabase.from('referrals').select('level').eq('referrer_id', userId),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]),
        Promise.race([
          supabase.from('commissions').select('amount, status').eq('user_id', userId),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]),
        Promise.race([
          supabase.from('mxi_withdrawal_schedule').select('*').eq('user_id', userId).single(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ])
      ]);

      const referralData = referralResult.status === 'fulfilled' && 'data' in referralResult.value 
        ? referralResult.value.data 
        : [];
      const commissionData = commissionResult.status === 'fulfilled' && 'data' in commissionResult.value 
        ? commissionResult.value.data 
        : [];
      const scheduleData = scheduleResult.status === 'fulfilled' && 'data' in scheduleResult.value 
        ? scheduleResult.value.data 
        : null;

      const referrals = {
        level1: Array.isArray(referralData) ? referralData.filter((r: any) => r.level === 1).length : 0,
        level2: Array.isArray(referralData) ? referralData.filter((r: any) => r.level === 2).length : 0,
        level3: Array.isArray(referralData) ? referralData.filter((r: any) => r.level === 3).length : 0,
      };

      const commissions = {
        total: Array.isArray(commissionData) ? commissionData.reduce((sum: number, c: any) => sum + parseFloat(c.amount?.toString() || '0'), 0) : 0,
        available: Array.isArray(commissionData) ? commissionData.filter((c: any) => c.status === 'available').reduce((sum: number, c: any) => sum + parseFloat(c.amount?.toString() || '0'), 0) : 0,
        withdrawn: Array.isArray(commissionData) ? commissionData.filter((c: any) => c.status === 'withdrawn').reduce((sum: number, c: any) => sum + parseFloat(c.amount?.toString() || '0'), 0) : 0,
      };

      const mappedUser: User = {
        id: userData.id,
        name: userData.name,
        idNumber: userData.id_number,
        address: userData.address,
        email: userData.email,
        emailVerified: userData.email_verified,
        mxiBalance: parseFloat(userData.mxi_balance?.toString() || '0'),
        usdtContributed: parseFloat(userData.usdt_contributed?.toString() || '0'),
        referralCode: userData.referral_code,
        referredBy: userData.referred_by,
        referrals,
        commissions,
        activeReferrals: userData.active_referrals || 0,
        canWithdraw: userData.can_withdraw || false,
        lastWithdrawalDate: userData.last_withdrawal_date,
        joinedDate: userData.joined_date,
        isActiveContributor: userData.is_active_contributor || false,
        yieldRatePerMinute: parseFloat(userData.yield_rate_per_minute?.toString() || '0'),
        lastYieldUpdate: userData.last_yield_update || new Date().toISOString(),
        accumulatedYield: parseFloat(userData.accumulated_yield?.toString() || '0'),
        availableMXI: scheduleData ? parseFloat(scheduleData.released_mxi?.toString() || '0') : 0,
        nextReleaseDate: scheduleData?.next_release_date,
        releasePercentage: scheduleData ? parseFloat(scheduleData.release_percentage?.toString() || '10') : 10,
        mxiPurchasedDirectly: parseFloat(userData.mxi_purchased_directly?.toString() || '0'),
        mxiFromUnifiedCommissions: parseFloat(userData.mxi_from_unified_commissions?.toString() || '0'),
        mxiFromChallenges: parseFloat(userData.mxi_from_challenges?.toString() || '0'),
        mxiVestingLocked: parseFloat(userData.mxi_vesting_locked?.toString() || '0'),
      };

      console.log('User data loaded successfully');
      
      setUser(mappedUser);
      setIsAuthenticated(true);
      setLoading(false);
      loadingUserData.current = false;
    } catch (error) {
      console.error('Error in loadUserData:', error);
      setLoading(false);
      loadingUserData.current = false;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('=== LOGIN ATTEMPT ===', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Correo electrónico o contraseña incorrectos. Por favor verifica tus credenciales.' };
        }
        
        return { success: false, error: error.message };
      }

      if (!data.session) {
        return { success: false, error: 'No se pudo crear la sesión. Por favor intenta de nuevo.' };
      }

      // Check if email is verified
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email_verified')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('Error checking email verification:', userError);
        // Continue with login even if we can't check verification status
      }

      if (userData && !userData.email_verified) {
        // Sign out the user
        await supabase.auth.signOut();
        return { 
          success: false, 
          error: 'Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada para el enlace de verificación.' 
        };
      }

      console.log('Login successful');
      return { success: true };
    } catch (error: any) {
      console.error('Login exception:', error);
      return { success: false, error: error.message || 'Error al iniciar sesión. Por favor intenta de nuevo.' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('=== REGISTRATION START ===', userData.email);

      // Check for existing email
      const { data: existingUser, error: emailCheckError } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email)
        .maybeSingle();

      if (emailCheckError) {
        console.error('Error checking existing email:', emailCheckError);
      }

      if (existingUser) {
        console.log('Email already exists');
        return { success: false, error: 'El correo electrónico ya está registrado' };
      }

      // Check for existing ID number
      const { data: existingId, error: idCheckError } = await supabase
        .from('users')
        .select('id_number')
        .eq('id_number', userData.idNumber)
        .maybeSingle();

      if (idCheckError) {
        console.error('Error checking existing ID:', idCheckError);
      }

      if (existingId) {
        console.log('ID number already exists');
        return { success: false, error: 'El número de identificación ya está registrado. Solo se permite una cuenta por persona.' };
      }

      // Create auth user
      console.log('Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            name: userData.name,
            id_number: userData.idNumber,
            address: userData.address,
          },
        },
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        console.error('No user returned from signup');
        return { success: false, error: 'Error al crear usuario' };
      }

      console.log('Auth user created successfully:', authData.user.id);

      // Wait for trigger to fire
      console.log('Waiting for database trigger to create profile...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if profile was created by trigger
      const { data: profileCheck, error: profileCheckError } = await supabase
        .from('users')
        .select('id, name, referral_code')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileCheckError) {
        console.error('Error checking profile:', profileCheckError);
      }

      let referralCode: string;
      let referrerId: string | null = null;

      // Find referrer if referral code provided
      if (userData.referralCode) {
        console.log('Looking up referrer with code:', userData.referralCode);
        const { data: referrerData, error: referrerError } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', userData.referralCode)
          .maybeSingle();

        if (referrerError) {
          console.error('Error finding referrer:', referrerError);
        }

        if (referrerData) {
          referrerId = referrerData.id;
          console.log('Found referrer:', referrerId);
        } else {
          console.log('Referral code not found, proceeding without referrer');
        }
      }

      if (profileCheck) {
        // Profile was created by trigger, update it with complete data
        console.log('Profile created by trigger, updating with complete user data');
        
        // Generate referral code if not already set
        if (profileCheck.referral_code && profileCheck.referral_code.startsWith('MXI')) {
          referralCode = profileCheck.referral_code;
          console.log('Using existing referral code:', referralCode);
        } else {
          const { data: codeData, error: codeError } = await supabase.rpc('generate_referral_code');
          if (codeError) {
            console.error('Error generating referral code:', codeError);
          }
          referralCode = codeData || `MXI${Date.now().toString().slice(-6)}`;
          console.log('Generated new referral code:', referralCode);
        }

        // Update the profile with complete data
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name: userData.name,
            id_number: userData.idNumber,
            address: userData.address,
            referral_code: referralCode,
            referred_by: referrerId,
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Profile update error:', updateError);
          // Don't fail registration if update fails
        } else {
          console.log('Profile updated successfully');
        }

        // Create referral chain if applicable
        if (referrerId) {
          console.log('Creating referral chain...');
          await createReferralChain(authData.user.id, referrerId);
        }
      } else {
        // Trigger didn't work, create profile manually
        console.log('Trigger did not create profile, creating manually');
        
        const { data: codeData, error: codeError } = await supabase.rpc('generate_referral_code');
        if (codeError) {
          console.error('Error generating referral code:', codeError);
        }
        referralCode = codeData || `MXI${Date.now().toString().slice(-6)}`;
        console.log('Generated referral code:', referralCode);

        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            name: userData.name,
            id_number: userData.idNumber,
            address: userData.address,
            email: userData.email,
            referral_code: referralCode,
            referred_by: referrerId,
            email_verified: false,
            is_active_contributor: false,
          });

        if (insertError) {
          console.error('User insert error:', insertError);
          return { success: false, error: 'Error al crear perfil de usuario. Por favor contacta soporte.' };
        }

        console.log('Profile created manually');

        if (referrerId) {
          console.log('Creating referral chain...');
          await createReferralChain(authData.user.id, referrerId);
        }
      }

      // Final verification
      const { data: finalCheck, error: finalCheckError } = await supabase
        .from('users')
        .select('id, name, email, referral_code')
        .eq('id', authData.user.id)
        .single();

      if (finalCheckError || !finalCheck) {
        console.error('Final verification failed:', finalCheckError);
        return { success: false, error: 'El usuario fue creado pero hubo un problema al verificar. Por favor contacta soporte.' };
      }

      console.log('=== REGISTRATION SUCCESSFUL ===', finalCheck);
      return { success: true };
    } catch (error: any) {
      console.error('=== REGISTRATION EXCEPTION ===', error);
      return { success: false, error: error.message || 'Error en el registro' };
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
        .single();

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
          .single();

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
    }
  };

  const logout = async () => {
    try {
      console.log('=== LOGOUT START ===');
      
      // Step 1: Clear local state IMMEDIATELY
      console.log('Step 1: Clearing local auth state...');
      clearAuthState();
      
      // Step 2: Sign out from Supabase with global scope
      console.log('Step 2: Signing out from Supabase...');
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Supabase signOut error:', error);
        // Continue anyway since local state is already cleared
      } else {
        console.log('Supabase signOut successful');
      }
      
      console.log('=== LOGOUT COMPLETE ===');
    } catch (error) {
      console.error('=== LOGOUT EXCEPTION ===', error);
      
      // Ensure state is cleared even on error
      clearAuthState();
    }
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

      await loadUserData(user.id);

      return { success: true };
    } catch (error: any) {
      console.error('Add contribution exception:', error);
      return { success: false, error: error.message || 'Failed to add contribution' };
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

  const resendVerificationEmail = async (): Promise<{ success: boolean; error?: string }> => {
    if (!session?.user?.email) {
      return { success: false, error: 'No email found' };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: session.user.email,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to resend email' };
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
    try {
      if (!user || user.yieldRatePerMinute === 0) return 0;

      const lastUpdate = new Date(user.lastYieldUpdate);
      const now = new Date();
      
      // Validate dates
      if (isNaN(lastUpdate.getTime()) || isNaN(now.getTime())) {
        console.error('Invalid date in getCurrentYield');
        return 0;
      }
      
      const minutesElapsed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
      
      // Prevent negative or unreasonably large values
      if (minutesElapsed < 0 || minutesElapsed > 10000) {
        console.error('Invalid minutes elapsed:', minutesElapsed);
        return 0;
      }
      
      const yield_amount = user.yieldRatePerMinute * minutesElapsed;
      
      // Validate result
      if (isNaN(yield_amount) || !isFinite(yield_amount)) {
        console.error('Invalid yield calculation result');
        return 0;
      }
      
      return yield_amount;
    } catch (error) {
      console.error('Error in getCurrentYield:', error);
      return 0;
    }
  };

  const getTotalMxiBalance = (): number => {
    try {
      if (!user) return 0;

      // Calculate total MXI balance including ALL sources:
      // 1. MXI purchased directly
      // 2. MXI from unified commissions
      // 3. MXI from challenges
      // 4. MXI vesting locked
      // 5. Accumulated yield
      // 6. Current real-time yield
      const mxiPurchased = parseFloat((user.mxiPurchasedDirectly || 0).toString());
      const mxiFromCommissions = parseFloat((user.mxiFromUnifiedCommissions || 0).toString());
      const mxiFromChallenges = parseFloat((user.mxiFromChallenges || 0).toString());
      const mxiVestingLocked = parseFloat((user.mxiVestingLocked || 0).toString());
      const accumulatedYield = parseFloat((user.accumulatedYield || 0).toString());
      const currentYield = getCurrentYield();

      // Validate all values
      const values = [mxiPurchased, mxiFromCommissions, mxiFromChallenges, mxiVestingLocked, accumulatedYield, currentYield];
      for (const value of values) {
        if (isNaN(value) || !isFinite(value)) {
          console.error('Invalid value in getTotalMxiBalance:', value);
          return 0;
        }
      }

      const total = mxiPurchased + mxiFromCommissions + mxiFromChallenges + mxiVestingLocked + accumulatedYield + currentYield;

      // Validate result
      if (isNaN(total) || !isFinite(total) || total < 0) {
        console.error('Invalid total MXI balance:', total);
        return 0;
      }

      return total;
    } catch (error) {
      console.error('Error in getTotalMxiBalance:', error);
      return 0;
    }
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
        addContribution,
        unifyCommissionToMXI,
        resendVerificationEmail,
        claimYield,
        getCurrentYield,
        getTotalMxiBalance,
        getPoolStatus,
        checkAdminStatus,
        getPhaseInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
