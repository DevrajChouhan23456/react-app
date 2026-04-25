const { getDefaultConfig } = require('expo/metro-config');
const exclusionList =
  require('metro-config/private/defaults/exclusionList').default;

const config = getDefaultConfig(__dirname);

// Add web support
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Support for .web.js/.web.ts extensions
config.resolver.sourceExts = [
  'web.js', 'web.jsx', 'web.ts', 'web.tsx',
  ...config.resolver.sourceExts,
];

// Ignore backend temp/cache folders that Metro should never try to crawl.
config.resolver.blockList = exclusionList([
  /backend\/\.tmp\/.*/,
  /backend\/.*__pycache__\/.*/,
]);

module.exports = config;
