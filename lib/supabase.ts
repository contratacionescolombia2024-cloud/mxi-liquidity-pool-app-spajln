
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

// Supabase configuration
const supabaseUrl = 'https://aeyfnjuatbtcauiumbhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleWZuanVhdGJ0Y2F1aXVtYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDI3NTEsImV4cCI6MjA3ODM3ODc1MX0.pefpNdgFtsbBifAtKXaQiWq7S7TioQ9PSGbycmivvDI';

// Check if we're in a proper runtime environment
// During SSR/build, we should not initialize the client
const canInitialize = () => {
  // Check if we're in a browser/native environment
  if (typeof window === 'undefined') {
    // We're in SSR or Node.js environment
    return false;
  }
  return true;
};

// Lazy initialization of Supabase client
let supabaseInstance: SupabaseClient | null = null;

const getSupabaseClient = (): SupabaseClient | null => {
  // If already initialized, return it
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Check if we can initialize
  if (!canInitialize()) {
    console.warn('Supabase client not initialized - running in SSR/build environment');
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
    console.log('Supabase client initialized successfully');
    return supabaseInstance;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
};

// Export a getter function instead of the client directly
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    if (!client) {
      console.warn(`Attempted to access supabase.${String(prop)} but client is not initialized`);
      return undefined;
    }
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

// Handle deep linking for email confirmation
export const handleDeepLink = async (url: string) => {
  console.log('Handling deep link:', url);
  
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase client not available');
    return { success: false, error: 'Service not available' };
  }

  try {
    const { data, error } = await client.auth.getSessionFromUrl({ url });
    
    if (error) {
      console.error('Error getting session from URL:', error);
      return { success: false, error: error.message };
    }
    
    if (data.session) {
      console.log('Session obtained from URL:', data.session);
      return { success: true, session: data.session };
    }
    
    return { success: false, error: 'No session found' };
  } catch (error: any) {
    console.error('Exception handling deep link:', error);
    return { success: false, error: error.message };
  }
};

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          id_number: string;
          address: string;
          email: string;
          email_verified: boolean;
          mxi_balance: number;
          usdt_contributed: number;
          referral_code: string;
          referred_by: string | null;
          active_referrals: number;
          can_withdraw: boolean;
          last_withdrawal_date: string | null;
          joined_date: string;
          created_at: string;
          updated_at: string;
          is_active_contributor: boolean;
          yield_rate_per_minute: number;
          last_yield_update: string;
          accumulated_yield: number;
        };
        Insert: {
          id?: string;
          name: string;
          id_number: string;
          address: string;
          email: string;
          email_verified?: boolean;
          mxi_balance?: number;
          usdt_contributed?: number;
          referral_code: string;
          referred_by?: string | null;
          active_referrals?: number;
          can_withdraw?: boolean;
          last_withdrawal_date?: string | null;
          joined_date?: string;
          created_at?: string;
          updated_at?: string;
          is_active_contributor?: boolean;
          yield_rate_per_minute?: number;
          last_yield_update?: string;
          accumulated_yield?: number;
        };
        Update: {
          id?: string;
          name?: string;
          id_number?: string;
          address?: string;
          email?: string;
          email_verified?: boolean;
          mxi_balance?: number;
          usdt_contributed?: number;
          referral_code?: string;
          referred_by?: string | null;
          active_referrals?: number;
          can_withdraw?: boolean;
          last_withdrawal_date?: string | null;
          joined_date?: string;
          created_at?: string;
          updated_at?: string;
          is_active_contributor?: boolean;
          yield_rate_per_minute?: number;
          last_yield_update?: string;
          accumulated_yield?: number;
        };
      };
      contributions: {
        Row: {
          id: string;
          user_id: string;
          usdt_amount: number;
          mxi_amount: number;
          transaction_type: 'initial' | 'increase' | 'reinvestment';
          status: 'pending' | 'completed' | 'failed';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          usdt_amount: number;
          mxi_amount: number;
          transaction_type: 'initial' | 'increase' | 'reinvestment';
          status?: 'pending' | 'completed' | 'failed';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          usdt_amount?: number;
          mxi_amount?: number;
          transaction_type?: 'initial' | 'increase' | 'reinvestment';
          status?: 'pending' | 'completed' | 'failed';
          created_at?: string;
        };
      };
      commissions: {
        Row: {
          id: string;
          user_id: string;
          from_user_id: string;
          level: number;
          amount: number;
          percentage: number;
          status: 'pending' | 'available' | 'withdrawn';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          from_user_id: string;
          level: number;
          amount: number;
          percentage: number;
          status?: 'pending' | 'available' | 'withdrawn';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          from_user_id?: string;
          level?: number;
          amount?: number;
          percentage?: number;
          status?: 'pending' | 'available' | 'withdrawn';
          created_at?: string;
        };
      };
      withdrawals: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          currency: 'USDT' | 'MXI';
          wallet_address: string;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          currency: 'USDT' | 'MXI';
          wallet_address: string;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          currency?: 'USDT' | 'MXI';
          wallet_address?: string;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          created_at?: string;
          completed_at?: string | null;
        };
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          level: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_id: string;
          level: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referred_id?: string;
          level?: number;
          created_at?: string;
        };
      };
      metrics: {
        Row: {
          id: string;
          total_members: number;
          total_usdt_contributed: number;
          total_mxi_distributed: number;
          pool_close_date: string;
          mxi_launch_date: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          total_members?: number;
          total_usdt_contributed?: number;
          total_mxi_distributed?: number;
          pool_close_date?: string;
          mxi_launch_date?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          total_members?: number;
          total_usdt_contributed?: number;
          total_mxi_distributed?: number;
          pool_close_date?: string;
          mxi_launch_date?: string;
          updated_at?: string;
        };
      };
    };
  };
}
