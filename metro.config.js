const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

let config = getDefaultConfig(__dirname);

// Add NativeWind
config = withNativeWind(config, { input: './app/global.css' });

// Add Reanimated
config = wrapWithReanimatedMetroConfig(config);

module.exports = config;
