
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
];

// Resolve extensions for web
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Add platform-specific extensions
config.resolver.platforms = ['ios', 'android', 'web', 'native'];

module.exports = config;
