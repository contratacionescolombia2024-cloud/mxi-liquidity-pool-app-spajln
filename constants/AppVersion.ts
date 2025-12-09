
// App version information
// Simplified version system without build timestamps

export const APP_VERSION = '1.0.3';
export const BUILD_ID = 'production';
export const BUILD_DATE = new Date().toISOString();

// Log version information
console.log('═'.repeat(70));
console.log('🚀 MXI LIQUIDITY POOL APP - INFORMACIÓN DE VERSIÓN');
console.log('═'.repeat(70));
console.log('📦 Versión:', APP_VERSION);
console.log('🔨 Build ID:', BUILD_ID);
console.log('📅 Build Date:', BUILD_DATE);
console.log('🌐 Plataforma:', typeof window !== 'undefined' ? 'Web' : 'Native');
console.log('═'.repeat(70));
