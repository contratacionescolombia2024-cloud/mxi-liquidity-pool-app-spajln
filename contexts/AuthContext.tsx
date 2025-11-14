
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, initializeSupabase } from '@/lib/supabase';
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
  kycStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  kycVerifiedAt?: string;
  availableMXI?: number;
  nextReleaseDate?: string;
  releasePercentage?: number;
  mxiPurchasedDirectly?: number;
  mxiFromUnifiedCommissions?: number;
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
  withdrawCommission: (amount: number, walletAddress: string) => Promise<{ success: boolean; error?: string }>;
  withdrawMXI: (amount: number, walletAddress: string) => Promise<{ success: boolean; error?: string }>;
  unifyCommissionToMXI: (amount: number) => Promise<{ success: boolean; mxiAmount?: number; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supabaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    // Check if we're in a client environment
    if (typeof window === 'undefined' && typeof global === 'undefined') {
      console.log('Not in client environment, skipping auth initialization');
      setLoading(false);
      return;
    }

    // Initialize Supabase first
    const init = async () => {
      console.log('🚀 Initializing Supabase client...');
      
      // Wait a bit to ensure the environment is fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const initialized = await initializeSupabase();
      
      if (!initialized) {
        console.warn('⚠️ Supabase client could not be initialized');
        setLoading(false);
        return;
      }

      console.log('✅ Supabase client ready');
      setSupabaseReady(true);

      // Additional delay to ensure storage is ready
      await new Promise(resolve => setTimeout(resolve, 300));
      
      initAuth();
    };

    init();
  }, []);

  const initAuth = async () => {
    try {
      // Check if supabase is available
      if (!supabase || !supabase.auth) {
        console.warn('Supabase client not initialized');
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initial session:', session ? 'Found' : 'None');
      setSession(session);
      if (session) {
        await loadUserData(session.user.id);
      } else {
        setLoading(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        console.log('Auth state changed:', _event);
        setSession(session);
        
        if (_event === 'SIGNED_IN' && session) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', session.user.id)
            .single();
          
          if (!existingUser && session.user.email) {
            await supabase
              .from('users')
              .update({ email_verified: true })
              .eq('email', session.user.email);
          }
          
          await loadUserData(session.user.id);
        } else if (session) {
          await loadUserData(session.user.id);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Error initializing auth:', error);
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    if (!supabase || !supabase.from) {
      console.warn('Supabase client not initialized');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading user data for:', userId);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

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
        .single();

      const mappedUser: User = {
        id: userData.id,
        name: userData.name,
        idNumber: userData.id_number,
        address: userData.address,
        email: userData.email,
        emailVerified: userData.email_verified,
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
      };

      console.log('✅ User data loaded successfully');
      setUser(mappedUser);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('Error in loadUserData:', error);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabaseReady || !supabase || !supabase.auth) {
      return { success: false, error: 'Service not available. Please wait a moment and try again.' };
    }

    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }

      if (!data.session) {
        return { success: false, error: 'No session created' };
      }

      const { data: userData } = await supabase
        .from('users')
        .select('email_verified')
        .eq('id', data.user.id)
        .single();

      if (userData && !userData.email_verified) {
        await supabase.auth.signOut();
        return { success: false, error: 'Please verify your email before logging in. Check your inbox for the verification link.' };
      }

      console.log('Login successful');
      return { success: true };
    } catch (error: any) {
      console.error('Login exception:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    if (!supabaseReady || !supabase || !supabase.auth) {
      return { success: false, error: 'Service not available. Please wait a moment and try again.' };
    }

    try {
      console.log('Attempting registration for:', userData.email);

      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      const { data: existingId } = await supabase
        .from('users')
        .select('id_number')
        .eq('id_number', userData.idNumber)
        .single();

      if (existingId) {
        return { success: false, error: 'ID number already registered. Only one account per person is allowed.' };
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            name: userData.name,
          },
        },
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user' };
      }

      const { data: codeData } = await supabase.rpc('generate_referral_code');
      const referralCode = codeData || `MXI${Date.now().toString().slice(-6)}`;

      let referrerId: string | null = null;
      if (userData.referralCode) {
        const { data: referrerData } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', userData.referralCode)
          .single();

        if (referrerData) {
          referrerId = referrerData.id;
        }
      }

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
          kyc_status: 'not_submitted',
        });

      if (insertError) {
        console.error('User insert error:', insertError);
        return { success: false, error: 'Failed to create user profile. Please try again.' };
      }

      if (referrerId) {
        await createReferralChain(authData.user.id, referrerId);
      }

      console.log('Registration successful. Please verify your email.');
      return { success: true };
    } catch (error: any) {
      console.error('Registration exception:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const createReferralChain = async (newUserId: string, directReferrerId: string) => {
    if (!supabase || !supabase.from) return;

    try {
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
          await supabase.from('referrals').insert({
            referrer_id: level3Data.referred_by,
            referred_id: newUserId,
            level: 3,
          });
        }
      }
    } catch (error) {
      console.error('Error creating referral chain:', error);
    }
  };

  const logout = async () => {
    if (!supabase || !supabase.auth) return;

    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user || !supabase || !supabase.from) return;

    try {
      const dbUpdates: any = {};
      
      if (updates.name) dbUpdates.name = updates.name;
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
    if (!user || !supabase || !supabase.rpc) return { success: false, error: 'Not authenticated' };

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

  const withdrawCommission = async (
    amount: number,
    walletAddress: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !supabase || !supabase.from) return { success: false, error: 'Not authenticated' };

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
    if (!user || !supabase || !supabase.rpc) return { success: false, error: 'Not authenticated' };

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
    if (!user || !supabase || !supabase.rpc) return { success: false, error: 'Not authenticated' };

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
    if (!user || !supabase || !supabase.rpc) return 0;

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

  const resendVerificationEmail = async (): Promise<{ success: boolean; error?: string }> => {
    if (!session?.user?.email || !supabase || !supabase.auth) {
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

  const checkWithdrawalEligibility = async (): Promise<boolean> => {
    if (!user || !supabase || !supabase.rpc) return false;

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
    if (!user || !supabase || !supabase.rpc) return { success: false, error: 'Not authenticated' };

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
    if (!supabase || !supabase.rpc) return null;

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
    if (!user || !supabase || !supabase.rpc) return false;

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
    if (!user || !supabase || !supabase.from) return false;

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
    if (!supabase || !supabase.rpc) return null;

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
