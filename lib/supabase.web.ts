
import { SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://aeyfnjuatbtcauiumbhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleWZuanVhdGJ0Y2F1aXVtYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDI3NTEsImV4cCI6MjA3ODM3ODc1MX0.pefpNdgFtsbBifAtKXaQiWq7S7TioQ9PSGbycmivvDI';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

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

  // Check if we're in a browser
  if (!isBrowser) {
    console.warn('Supabase client not initialized - not in browser environment');
    initializationAttempted = true;
    return null;
  }

  try {
    // Dynamically import dependencies only when in browser environment
    const { createClient } = require('@supabase/supabase-js');
    
    // For web, use localStorage instead of AsyncStorage
    const storage = {
      getItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      },
    };

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
    
    initializationAttempted = true;
    console.log('Supabase client initialized successfully (web)');
    return supabaseInstance;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    initializationAttempted = true;
    return null;
  }
};

// Export a Proxy that lazily initializes the client
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    if (!client) {
      console.warn(`Attempted to access supabase.${String(prop)} but client is not initialized`);
      // Return a no-op function for method calls to prevent crashes
      return typeof prop === 'string' && prop !== 'constructor' 
        ? () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') })
        : undefined;
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

// Re-export Database types
export type { Database } from './supabase';
