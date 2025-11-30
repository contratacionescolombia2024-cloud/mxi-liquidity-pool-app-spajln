
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://aeyfnjuatbtcauiumbhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleWZuanVhdGJ0Y2F1aXVtYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDI3NTEsImV4cCI6MjA3ODM3ODc1MX0.pefpNdgFtsbBifAtKXaQiWq7S7TioQ9PSGbycmivvDI';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

console.log('Supabase Web Client - isBrowser:', isBrowser);
console.log('Supabase Web Client - Version:', '1.0.1'); // Version tracking for cache busting

// Clear any stale auth data on initialization
if (isBrowser) {
  console.log('Checking for stale auth data...');
  const authKeys = Object.keys(window.localStorage).filter(key => 
    key.includes('supabase.auth.token') || key.includes('sb-')
  );
  console.log('Found auth keys:', authKeys.length);
}

// For web, use localStorage with error handling
const storage = {
  getItem: (key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const value = window.localStorage.getItem(key);
        console.log(`Storage GET: ${key} = ${value ? 'exists' : 'null'}`);
        return value;
      }
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        console.log(`Storage SET: ${key}`);
      }
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
    }
  },
  removeItem: (key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        console.log(`Storage REMOVE: ${key}`);
      }
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
    }
  },
};

// Create the Supabase client with optimized settings for web
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Reduce timeout for faster feedback
    storageKey: 'sb-aeyfnjuatbtcauiumbhn-auth-token',
    debug: true, // Enable debug mode for better logging
  },
  global: {
    headers: {
      'X-Client-Info': 'mxi-web-app@1.0.1',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

console.log('Supabase client initialized for web with enhanced settings');

// Add session recovery on page load
if (isBrowser) {
  console.log('Setting up session recovery...');
  
  // Check for session immediately
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      console.error('Error recovering session:', error);
    } else if (session) {
      console.log('Session recovered successfully:', session.user.email);
    } else {
      console.log('No session to recover');
    }
  });

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
    
    // Handle specific events
    if (event === 'SIGNED_OUT') {
      console.log('User signed out, clearing all auth data');
      // Clear all auth-related localStorage items
      Object.keys(window.localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          window.localStorage.removeItem(key);
        }
      });
    }
    
    if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed successfully');
    }
    
    if (event === 'SIGNED_IN') {
      console.log('User signed in successfully');
    }
  });
}

// Handle deep linking for email confirmation
export const handleDeepLink = async (url: string) => {
  console.log('Handling deep link:', url);
  
  try {
    const { data, error } = await supabase.auth.getSessionFromUrl({ url });
    
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

// Add cache busting utility
export const clearAppCache = async () => {
  if (!isBrowser) return;
  
  console.log('Clearing app cache...');
  
  try {
    // Clear localStorage
    const keysToKeep = ['language', 'theme'];
    Object.keys(window.localStorage).forEach(key => {
      if (!keysToKeep.includes(key)) {
        window.localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    window.sessionStorage.clear();
    
    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service worker unregistered');
      }
    }
    
    // Clear cache storage
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Cache storage cleared');
    }
    
    console.log('App cache cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

// Re-export Database types
export type { Database } from './supabase';
