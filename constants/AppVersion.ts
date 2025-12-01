
// App version and build information
// This file is automatically updated on each build to ensure cache busting

export const APP_VERSION = '1.0.3';

// BUILD_TIMESTAMP will be replaced during build process
export const BUILD_TIMESTAMP = Date.now();

// This will be replaced at build time
export const BUILD_DATE = new Date(BUILD_TIMESTAMP).toISOString();

// Generate a unique build ID based on timestamp
export const BUILD_ID = `v${APP_VERSION}-${BUILD_TIMESTAMP}`;

// Function to check if app needs update (for web)
export const checkForUpdates = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedBuildId = window.localStorage.getItem('app_build_id');
    const storedTimestamp = window.localStorage.getItem('app_build_timestamp');
    
    // Check if there's a new build
    if (storedBuildId && storedBuildId !== BUILD_ID) {
      console.log('🔄 Nueva versión detectada!');
      console.log('  Versión anterior:', storedBuildId);
      console.log('  Versión nueva:', BUILD_ID);
      return true;
    }
    
    // Also check timestamp directly
    if (storedTimestamp && parseInt(storedTimestamp) !== BUILD_TIMESTAMP) {
      console.log('🔄 Nuevo timestamp detectado!');
      console.log('  Timestamp anterior:', storedTimestamp);
      console.log('  Timestamp nuevo:', BUILD_TIMESTAMP);
      return true;
    }
    
    // Store current build ID and timestamp
    window.localStorage.setItem('app_build_id', BUILD_ID);
    window.localStorage.setItem('app_build_timestamp', BUILD_TIMESTAMP.toString());
  }
  
  return false;
};

// Function to force reload on web
export const forceReload = () => {
  if (typeof window !== 'undefined') {
    console.log('🔄 Forzando recarga de la aplicación...');
    console.log('  Versión:', BUILD_ID);
    console.log('  Timestamp:', BUILD_TIMESTAMP);
    
    // Clear all caches except authentication
    if (window.localStorage) {
      const keysToKeep = ['supabase.auth.token'];
      const allKeys = Object.keys(window.localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          window.localStorage.removeItem(key);
        }
      });
      
      // Update to new version
      window.localStorage.setItem('app_build_id', BUILD_ID);
      window.localStorage.setItem('app_build_timestamp', BUILD_TIMESTAMP.toString());
    }
    
    // Clear session storage
    if (window.sessionStorage) {
      window.sessionStorage.clear();
    }
    
    // Unregister service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }
    
    // Clear cache storage
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Force hard reload with cache bypass
    window.location.reload();
  }
};

// Periodic check for updates (every 5 minutes)
export const startUpdateChecker = (onUpdateAvailable: () => void) => {
  if (typeof window !== 'undefined') {
    const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
    
    const checkInterval = setInterval(() => {
      console.log('🔍 Verificando actualizaciones...');
      
      // Fetch the current version from the server
      fetch('/app-version.json?t=' + Date.now())
        .then(response => response.json())
        .then(data => {
          if (data.buildTimestamp && data.buildTimestamp !== BUILD_TIMESTAMP) {
            console.log('✅ Nueva versión disponible en el servidor!');
            console.log('  Versión servidor:', data.buildTimestamp);
            console.log('  Versión local:', BUILD_TIMESTAMP);
            onUpdateAvailable();
          } else {
            console.log('✅ Aplicación actualizada');
          }
        })
        .catch(error => {
          console.log('⚠️ Error verificando actualizaciones:', error);
        });
    }, CHECK_INTERVAL);
    
    // Initial check after 10 seconds
    setTimeout(() => {
      console.log('🔍 Verificación inicial de actualizaciones...');
      fetch('/app-version.json?t=' + Date.now())
        .then(response => response.json())
        .then(data => {
          if (data.buildTimestamp && data.buildTimestamp !== BUILD_TIMESTAMP) {
            console.log('✅ Nueva versión disponible en el servidor!');
            onUpdateAvailable();
          }
        })
        .catch(error => {
          console.log('⚠️ Error en verificación inicial:', error);
        });
    }, 10000);
    
    return () => clearInterval(checkInterval);
  }
  
  return () => {};
};

// Log version information
console.log('═'.repeat(70));
console.log('🚀 MXI LIQUIDITY POOL APP - INFORMACIÓN DE VERSIÓN');
console.log('═'.repeat(70));
console.log('📦 Versión:', APP_VERSION);
console.log('🆔 Build ID:', BUILD_ID);
console.log('📅 Fecha de Build:', BUILD_DATE);
console.log('⏰ Timestamp:', BUILD_TIMESTAMP);
console.log('🌐 Plataforma:', typeof window !== 'undefined' ? 'Web' : 'Native');
console.log('═'.repeat(70));
