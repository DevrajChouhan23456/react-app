module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated 4.x: plugin moved from react-native-reanimated/plugin
      // to react-native-worklets/plugin — must be LAST plugin
      'react-native-worklets/plugin',
    ],
  };
};
