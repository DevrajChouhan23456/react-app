const { getDefaultConfig } = require('expo/metro-config');
const exclusionList =
  require('metro-config/private/defaults/exclusionList').default;

const config = getDefaultConfig(__dirname);

// Platforms — Android/iOS must be resolved before web
config.resolver.platforms = ['android', 'ios', 'native', 'web'];

// IMPORTANT: native extensions must come BEFORE web extensions.
// If web.js is listed first, Metro picks RNLinking.web.js on Android too,
// causing "window.addEventListener is not a function" errors.
config.resolver.sourceExts = [
  ...config.resolver.sourceExts.filter(
    (ext) => !ext.startsWith('web')
  ),
  // web extensions last — only used when platform === 'web'
  'web.js',
  'web.jsx',
  'web.ts',
  'web.tsx',
];

// Ignore backend temp/cache folders that Metro should never try to crawl.
config.resolver.blockList = exclusionList([
  /backend\/\.tmp\/.*/,
  /backend\/.*__pycache__\/.*/,
]);

module.exports = config;
