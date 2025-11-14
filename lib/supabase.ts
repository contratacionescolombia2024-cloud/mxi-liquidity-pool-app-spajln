
import { SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { getStorageAdapter } from './storage-adapter';

// Supabase configuration
const supabaseUrl = 'https://aeyfnjuatbtcauiumbhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleWZuanVhdGJ0Y2F1aXVtYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDI3NTEsImV4cCI6MjA3ODM3ODc1MX0.pefpNdgFtsbBifAtKXaQiWq7S7TioQ9PSGbycmivvDI';

// Check if we're in a proper runtime environment
const canInitialize = (): boolean => {
  // During SSR/build, prevent initialization
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_STATIC_RENDERING) {
    return false;
  }

  // For web, check for window
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  // For native, we're good to go if we're not in a build environment
  return typeof global !== 'undefined';
};

// Lazy initialization of Supabase client
let supabaseInstance: SupabaseClient | null = null;
let initializationAttempted = false;
let initializationPromise: Promise<SupabaseClient | null> | null = null;

const createSupabaseClient = async (): Promise<SupabaseClient | null> => {
  // If already initialized, return it
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
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

  // Create initialization promise
  initializationPromise = (async () => {
    try {
      // Dynamically import Supabase to prevent build-time execution
      const { createClient } = await import('@supabase/supabase-js');
      
      // Get the appropriate storage adapter (lazy)
      const storage = getStorageAdapter();

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
      console.log('✅ Supabase client initialized successfully');
      return supabaseInstance;
    } catch (error) {
      console.error('❌ Error creating Supabase client:', error);
      initializationAttempted = true;
      initializationPromise = null;
      return null;
    }
  })();

  return initializationPromise;
};

// Get the Supabase client (synchronous access)
const getSupabaseClient = (): SupabaseClient | null => {
  return supabaseInstance;
};

// Create a no-op handler for when Supabase is not initialized
const createNoOpHandler = (path: string[] = []): any => {
  const handler = new Proxy(() => {}, {
    get: (target, prop) => {
      // Handle Promise-like properties
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return undefined;
      }
      
      if (prop === Symbol.toStringTag) {
        return 'SupabaseProxy';
      }

      const newPath = [...path, String(prop)];
      return createNoOpHandler(newPath);
    },
    apply: () => {
      const pathStr = path.join('.');
      console.warn(`⚠️ Attempted to call supabase.${pathStr}() but client is not initialized`);
      return Promise.resolve({ data: null, error: new Error('Supabase not initialized') });
    }
  });

  return handler;
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

    // Special method to initialize the client
    if (prop === '__initialize') {
      return createSupabaseClient;
    }

    // Special method to check if initialized
    if (prop === '__isInitialized') {
      return () => supabaseInstance !== null;
    }

    const client = getSupabaseClient();
    if (!client) {
      return createNoOpHandler([String(prop)]);
    }
    
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

// Initialize the client (call this from your app's entry point)
export const initializeSupabase = async (): Promise<boolean> => {
  const client = await createSupabaseClient();
  return client !== null;
};

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
