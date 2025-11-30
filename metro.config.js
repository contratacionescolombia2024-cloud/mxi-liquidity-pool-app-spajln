
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

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

// Add custom serializer to inject version info
const originalSerializer = config.serializer;
config.serializer = {
  ...originalSerializer,
  customSerializer: (entryPoint, preModules, graph, options) => {
    // Add build timestamp to the bundle
    const buildInfo = `
      // Build Information
      // Version: 1.0.1
      // Build Time: ${new Date().toISOString()}
      // Build Timestamp: ${Date.now()}
    `;
    
    if (originalSerializer?.customSerializer) {
      const result = originalSerializer.customSerializer(entryPoint, preModules, graph, options);
      return buildInfo + result;
    }
    
    return buildInfo;
  },
};

module.exports = config;
