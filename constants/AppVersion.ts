
// App version and build information
// This file is automatically updated on each build to ensure cache busting

export const APP_VERSION = '1.0.2';
export const BUILD_TIMESTAMP = Date.now();
export const BUILD_DATE = new Date().toISOString();

// Generate a unique build ID based on timestamp
export const BUILD_ID = `v${APP_VERSION}-${BUILD_TIMESTAMP}`;

// Function to check if app needs update (for web)
export const checkForUpdates = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedBuildId = window.localStorage.getItem('app_build_id');
    
    if (storedBuildId && storedBuildId !== BUILD_ID) {
      console.log('New version detected:', BUILD_ID, 'Previous:', storedBuildId);
      return true;
    }
    
    // Store current build ID
    window.localStorage.setItem('app_build_id', BUILD_ID);
  }
  
  return false;
};

// Function to force reload on web
export const forceReload = () => {
  if (typeof window !== 'undefined') {
    console.log('Forcing app reload for version:', BUILD_ID);
    
    // Clear all caches
    if (window.localStorage) {
      const keysToKeep = ['supabase.auth.token'];
      const allKeys = Object.keys(window.localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          window.localStorage.removeItem(key);
        }
      });
    }
    
    // Unregister service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }
    
    // Force hard reload
    window.location.reload();
  }
};

// Log version information
console.log('='.repeat(60));
console.log('MXI LIQUIDITY POOL APP - NUEVA VERSION');
console.log('='.repeat(60));
console.log('Version:', APP_VERSION);
console.log('Build ID:', BUILD_ID);
console.log('Build Date:', BUILD_DATE);
console.log('Build Timestamp:', BUILD_TIMESTAMP);
console.log('='.repeat(60));
