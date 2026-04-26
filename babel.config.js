module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated 3.x babel plugin — must be last
      'react-native-reanimated/plugin',
    ],
  };
};
