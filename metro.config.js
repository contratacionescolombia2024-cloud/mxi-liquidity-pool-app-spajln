
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for web
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.tsx', 'web.ts', 'web.jsx', 'web.js'];

// Ensure proper handling of async-storage
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Prevent async-storage from being loaded during SSR/build
  if (moduleName === '@react-native-async-storage/async-storage' && platform === 'web') {
    // Return a mock module for web builds
    return {
      type: 'empty',
    };
  }

  // Default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
