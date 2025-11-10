
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  checkWithdrawalEligibility: () => Promise<boolean>;
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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      if (session) {
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session);
      setSession(session);
      
      if (_event === 'SIGNED_IN' && session) {
        // Check if user record exists, if not create it
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', session.user.id)
          .single();
        
        if (!existingUser && session.user.email) {
          // User just verified email, update email_verified status
          await supabase
            .from('users')
            .update({ email_verified: true })
            .eq('email', session.user.email);
        }
        
        loadUserData(session.user.id);
      } else if (session) {
        loadUserData(session.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      console.log('Loading user data for:', userId);
      
      // Fetch user data from database
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

      // Fetch referral counts
      const { data: referralData } = await supabase
        .from('referrals')
        .select('level')
        .eq('referrer_id', userId);

      const referrals = {
        level1: referralData?.filter(r => r.level === 1).length || 0,
        level2: referralData?.filter(r => r.level === 2).length || 0,
        level3: referralData?.filter(r => r.level === 3).length || 0,
      };

      // Fetch commission data
      const { data: commissionData } = await supabase
        .from('commissions')
        .select('amount, status')
        .eq('user_id', userId);

      const commissions = {
        total: commissionData?.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0,
        available: commissionData?.filter(c => c.status === 'available').reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0,
        withdrawn: commissionData?.filter(c => c.status === 'withdrawn').reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0,
      };

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
      };

      console.log('User data loaded:', mappedUser);
      setUser(mappedUser);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('Error in loadUserData:', error);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
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

      // Check if email is verified
      const { data: userData } = await supabase
        .from('users')
        .select('email_verified')
        .eq('id', data.user.id)
        .single();

      if (userData && !userData.email_verified) {
        // Sign out the user since email is not verified
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
    try {
      console.log('Attempting registration for:', userData.email);

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      // Check if ID number already exists
      const { data: existingId } = await supabase
        .from('users')
        .select('id_number')
        .eq('id_number', userData.idNumber)
        .single();

      if (existingId) {
        return { success: false, error: 'ID number already registered. Only one account per person is allowed.' };
      }

      // Sign up with Supabase Auth - using Natively standard redirect URL
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

      // Generate referral code
      const { data: codeData } = await supabase.rpc('generate_referral_code');
      const referralCode = codeData || `MXI${Date.now().toString().slice(-6)}`;

      // Verify referral code if provided
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

      // Create user record in database
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
        });

      if (insertError) {
        console.error('User insert error:', insertError);
        return { success: false, error: 'Failed to create user profile. Please try again.' };
      }

      // Create referral relationships if referred by someone
      if (referrerId) {
        await createReferralChain(authData.user.id, referrerId);
      }

      // Update metrics
      await supabase.rpc('increment_total_members');

      console.log('Registration successful. Please verify your email.');
      return { success: true };
    } catch (error: any) {
      console.error('Registration exception:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const createReferralChain = async (newUserId: string, directReferrerId: string) => {
    try {
      // Level 1: Direct referrer
      await supabase.from('referrals').insert({
        referrer_id: directReferrerId,
        referred_id: newUserId,
        level: 1,
      });

      // Level 2: Referrer's referrer
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

        // Level 3: Referrer's referrer's referrer
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
    if (!user) return;

    try {
      const dbUpdates: any = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.address) dbUpdates.address = updates.address;
      if (updates.mxiBalance !== undefined) dbUpdates.mxi_balance = updates.mxiBalance;
      if (updates.usdtContributed !== undefined) dbUpdates.usdt_contributed = updates.usdtContributed;
      if (updates.activeReferrals !== undefined) dbUpdates.active_referrals = updates.activeReferrals;
      if (updates.canWithdraw !== undefined) dbUpdates.can_withdraw = updates.canWithdraw;
      if (updates.lastWithdrawalDate) dbUpdates.last_withdrawal_date = updates.lastWithdrawalDate;

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
      // Calculate MXI tokens (1 MXI = 10 USDT)
      const mxiTokens = usdtAmount / 10;

      // Create contribution record
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

      // Update user balance
      const newMxiBalance = user.mxiBalance + mxiTokens;
      const newUsdtContributed = user.usdtContributed + usdtAmount;

      const { error: updateError } = await supabase
        .from('users')
        .update({
          mxi_balance: newMxiBalance,
          usdt_contributed: newUsdtContributed,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update balance error:', updateError);
        return { success: false, error: 'Failed to update balance' };
      }

      // Process referral commissions
      await supabase.rpc('process_referral_commissions', {
        p_user_id: user.id,
        p_contribution_amount: usdtAmount,
      });

      // Update active referrals count for referrer
      if (user.referredBy && transactionType === 'initial') {
        await supabase.rpc('increment_active_referrals', {
          p_user_id: user.referredBy,
        });
      }

      // Reload user data
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

    if (!user.canWithdraw) {
      return { success: false, error: 'Withdrawal not available. You need 5 active referrals and 10 days since joining.' };
    }

    if (amount > user.commissions.available) {
      return { success: false, error: 'Insufficient available commission' };
    }

    try {
      // Create withdrawal record
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

      // Update commission status to withdrawn
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

      // Update user's last withdrawal date
      await updateUser({ lastWithdrawalDate: new Date().toISOString() });

      // Reload user data
      await loadUserData(user.id);

      return { success: true };
    } catch (error: any) {
      console.error('Withdraw commission exception:', error);
      return { success: false, error: error.message || 'Withdrawal failed' };
    }
  };

  const withdrawMXI = async (
    amount: number,
    walletAddress: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    // Check if MXI launch date has passed
    const launchDate = new Date('2025-01-15T12:00:00Z');
    const now = new Date();

    if (now < launchDate) {
      return { success: false, error: 'MXI withdrawals will be available on January 15, 2025 at 12:00 UTC' };
    }

    if (amount > user.mxiBalance) {
      return { success: false, error: 'Insufficient MXI balance' };
    }

    try {
      // Create withdrawal record
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

      // Update user MXI balance
      const { error: updateError } = await supabase
        .from('users')
        .update({
          mxi_balance: user.mxiBalance - amount,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update MXI balance error:', updateError);
        return { success: false, error: 'Failed to update balance' };
      }

      // Reload user data
      await loadUserData(user.id);

      return { success: true };
    } catch (error: any) {
      console.error('Withdraw MXI exception:', error);
      return { success: false, error: error.message || 'Withdrawal failed' };
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

  const checkWithdrawalEligibility = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('check_withdrawal_eligibility', {
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
        resendVerificationEmail,
        checkWithdrawalEligibility,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
