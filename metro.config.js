
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
];

// Add cache reset configuration for web builds
config.resetCache = true;

// Configure transformer to include build timestamp in bundles
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer?.minifierConfig,
    // Keep console logs in production for debugging
    compress: {
      ...config.transformer?.minifierConfig?.compress,
      drop_console: false,
    },
  },
};

// Inject build timestamp into AppVersion.ts during build
const originalGetTransformOptions = config.transformer.getTransformOptions;
config.transformer.getTransformOptions = async (entryPoints, options, getDependenciesOf) => {
  const transformOptions = originalGetTransformOptions
    ? await originalGetTransformOptions(entryPoints, options, getDependenciesOf)
    : {};

  // Generate unique build timestamp
  const buildTimestamp = Date.now();
  console.log('\n' + '═'.repeat(70));
  console.log('🔨 GENERANDO BUILD CON TIMESTAMP ÚNICO');
  console.log('═'.repeat(70));
  console.log('⏰ Build Timestamp:', buildTimestamp);
  console.log('📅 Build Date:', new Date(buildTimestamp).toISOString());
  console.log('═'.repeat(70) + '\n');

  // Update AppVersion.ts with new timestamp
  const appVersionPath = path.join(__dirname, 'constants', 'AppVersion.ts');
  if (fs.existsSync(appVersionPath)) {
    let content = fs.readFileSync(appVersionPath, 'utf8');
    
    // Replace the BUILD_TIMESTAMP value
    content = content.replace(
      /export const BUILD_TIMESTAMP = \d+;/,
      `export const BUILD_TIMESTAMP = ${buildTimestamp};`
    );
    
    fs.writeFileSync(appVersionPath, content, 'utf8');
    console.log('✅ AppVersion.ts actualizado con nuevo timestamp');
  }

  // Create app-version.json for web
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const versionInfo = {
    version: '1.0.3',
    buildTimestamp: buildTimestamp,
    buildDate: new Date(buildTimestamp).toISOString(),
    buildId: `v1.0.3-${buildTimestamp}`
  };
  
  fs.writeFileSync(
    path.join(publicDir, 'app-version.json'),
    JSON.stringify(versionInfo, null, 2),
    'utf8'
  );
  console.log('✅ app-version.json creado en public/');

  return transformOptions;
};

module.exports = config;
