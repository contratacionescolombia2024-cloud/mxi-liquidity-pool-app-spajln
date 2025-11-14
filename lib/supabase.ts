
import { SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Supabase configuration
const supabaseUrl = 'https://aeyfnjuatbtcauiumbhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleWZuanVhdGJ0Y2F1aXVtYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDI3NTEsImV4cCI6MjA3ODM3ODc1MX0.pefpNdgFtsbBifAtKXaQiWq7S7TioQ9PSGbycmivvDI';

// Check if we're in a proper runtime environment
const canInitialize = () => {
  // During SSR/build, window is undefined
  if (typeof window === 'undefined') {
    return false;
  }
  return true;
};

// Lazy initialization of Supabase client
let supabaseInstance: SupabaseClient | null = null;
let initializationAttempted = false;

const getSupabaseClient = (): SupabaseClient | null => {
  // If already initialized, return it
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // If we already tried and failed, don't try again
  if (initializationAttempted && !supabaseInstance) {
    return null;
  }

  // Check if we can initialize
  if (!canInitialize()) {
    console.warn('Supabase client not initialized - running in SSR/build environment');
    initializationAttempted = true;
    return null;
  }

  try {
    // Dynamically import dependencies only when in browser environment
    // This prevents the imports from being executed during build
    const { createClient } = require('@supabase/supabase-js');
    
    // For React Native, we need AsyncStorage
    let storage;
    if (Platform.OS === 'web') {
      // Use localStorage for web
      storage = {
        getItem: (key: string) => {
          if (typeof window !== 'undefined' && window.localStorage) {
            return Promise.resolve(window.localStorage.getItem(key));
          }
          return Promise.resolve(null);
        },
        setItem: (key: string, value: string) => {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
          }
          return Promise.resolve();
        },
        removeItem: (key: string) => {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
          }
          return Promise.resolve();
        },
      };
    } else {
      // Use AsyncStorage for native platforms
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      storage = AsyncStorage;
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
        flowType: 'pkce',
      },
    });
    
    initializationAttempted = true;
    console.log('Supabase client initialized successfully');
    return supabaseInstance;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    initializationAttempted = true;
    return null;
  }
};

// Create a no-op handler for when Supabase is not initialized
const createNoOpHandler = (path: string[] = []): any => {
  return new Proxy(() => {}, {
    get: (target, prop) => {
      const newPath = [...path, String(prop)];
      console.warn(`Attempted to access supabase.${newPath.join('.')} but client is not initialized`);
      return createNoOpHandler(newPath);
    },
    apply: () => {
      console.warn(`Attempted to call supabase.${path.join('.')}() but client is not initialized`);
      return Promise.resolve({ data: null, error: new Error('Supabase not initialized') });
    }
  });
};

// Export a Proxy that lazily initializes the client
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    // Special handling for common properties
    if (prop === 'then' || prop === 'catch' || prop === 'finally') {
      return undefined;
    }
    
    if (prop === Symbol.toStringTag) {
      return 'SupabaseClient';
    }

    const client = getSupabaseClient();
    if (!client) {
      return createNoOpHandler([String(prop)]);
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
