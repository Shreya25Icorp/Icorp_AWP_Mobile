const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

module.exports = (async () => {
  const {
    resolver: { assetExts },
  } = await getDefaultConfig();

  return mergeConfig(getDefaultConfig(__dirname), {
    resolver: {
      assetExts: [...assetExts, 'png', 'jpg', 'jpeg', 'gif'], // Ensure you are handling image assets correctly
    },
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300,
      poll: 1000,
    },
  });
})();
