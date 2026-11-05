const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
// Rive files are bundled as assets and loaded with require().
config.resolver.assetExts.push("riv");

module.exports = withNativeWind(config, { input: "./app/global.css" });
