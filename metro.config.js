const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure 'cjs' is included in source extensions for Firebase compatibility
config.resolver.sourceExts.push('cjs');

module.exports = config;
