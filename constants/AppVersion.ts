
// App version and build information
// This file is automatically updated on each build to ensure cache busting

export const APP_VERSION = '1.0.3';

// BUILD_TIMESTAMP will be replaced during build process
// DO NOT change this line - it's replaced by the prebuild script
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
    console.log('═'.repeat(70));
    console.log('🔄 FORZANDO RECARGA DE LA APLICACIÓN');
    console.log('═'.repeat(70));
    console.log('  Versión actual:', BUILD_ID);
    console.log('  Timestamp:', BUILD_TIMESTAMP);
    console.log('  Fecha:', BUILD_DATE);
    console.log('═'.repeat(70));
    
    // Step 1: Clear all localStorage except auth
    if (window.localStorage) {
      console.log('🗑️ Limpiando localStorage...');
      const keysToKeep = ['supabase.auth.token'];
      const allKeys = Object.keys(window.localStorage);
      let clearedCount = 0;
      
      allKeys.forEach(key => {
        if (!keysToKeep.some(keepKey => key.includes(keepKey))) {
          window.localStorage.removeItem(key);
          clearedCount++;
        }
      });
      
      console.log(`✅ ${clearedCount} items eliminados de localStorage`);
      
      // Update to new version
      window.localStorage.setItem('app_build_id', BUILD_ID);
      window.localStorage.setItem('app_build_timestamp', BUILD_TIMESTAMP.toString());
      window.localStorage.setItem('last_reload', Date.now().toString());
    }
    
    // Step 2: Clear session storage
    if (window.sessionStorage) {
      console.log('🗑️ Limpiando sessionStorage...');
      window.sessionStorage.clear();
      console.log('✅ sessionStorage limpiado');
    }
    
    // Step 3: Unregister service workers
    if ('serviceWorker' in navigator) {
      console.log('🗑️ Desregistrando service workers...');
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log(`📋 ${registrations.length} service workers encontrados`);
        registrations.forEach((registration, index) => {
          registration.unregister();
          console.log(`✅ Service worker ${index + 1} desregistrado`);
        });
      });
    }
    
    // Step 4: Clear cache storage
    if ('caches' in window) {
      console.log('🗑️ Limpiando cache storage...');
      caches.keys().then(names => {
        console.log(`📋 ${names.length} caches encontrados`);
        names.forEach((name, index) => {
          caches.delete(name);
          console.log(`✅ Cache ${index + 1} eliminado: ${name}`);
        });
      });
    }
    
    // Step 5: Force hard reload with cache bypass
    console.log('🔄 Recargando aplicación...');
    console.log('═'.repeat(70));
    
    // Use location.replace to force a complete reload
    setTimeout(() => {
      window.location.replace(window.location.href + '?t=' + Date.now());
    }, 500);
  }
};

// Periodic check for updates (placeholder for future implementation)
// Currently, updates are only checked on initial load
export const startUpdateChecker = (onUpdateAvailable: () => void) => {
  if (typeof window !== 'undefined') {
    console.log('📋 Update checker initialized (checks on load only)');
    
    // Future enhancement: implement periodic server-side version checking
    // For now, we rely on the initial checkForUpdates() call
    
    return () => {
      console.log('📋 Update checker cleanup');
    };
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
