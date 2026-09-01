module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // babel-preset-expo 54 already injects react-native-worklets/plugin
    // (and reanimated/plugin is an alias of the same plugin). Do not add them again.
  };
};
