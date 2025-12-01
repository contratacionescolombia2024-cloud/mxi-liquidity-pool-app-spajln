
// App version and build information
// This file is automatically updated on each build to ensure cache busting

export const APP_VERSION = '1.0.3';

// BUILD_TIMESTAMP with default value to prevent errors
// This will be replaced during build process
undefined

// This will be replaced at build time
export const BUILD_DATE = new Date(BUILD_TIMESTAMP).toISOString();

// Generate a unique build ID based on timestamp
export const BUILD_ID = `v${APP_VERSION}-${BUILD_TIMESTAMP}`;

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
