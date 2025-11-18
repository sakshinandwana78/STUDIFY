// Learn more https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

// Explicitly include common image extensions and add 3D model types.
// We merge rather than mutate to avoid accidental overrides.
const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
const modelExts = ['glb', 'gltf', 'bin', 'obj', 'mtl'];

module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    assetExts: [
      ...defaultConfig.resolver.assetExts,
      ...imageExts,
      ...modelExts,
    ],
  },
};
