const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web support
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Support for .web.js/.web.ts extensions
config.resolver.sourceExts = [
  'web.js', 'web.jsx', 'web.ts', 'web.tsx',
  ...config.resolver.sourceExts,
];

module.exports = config;
