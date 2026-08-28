module.exports = function (api) {
  api.cache(true);
  let plugins = [];

  plugins.push("react-native-worklets/plugin");
  //Trong file babel.config.js, plugin "react-native-reanimated/plugin" luôn phải nằm ở cuối danh sách plugin — sau tất cả các plugin khác.

  // 👇 Thêm dòng này cuối cùng
  plugins.push("react-native-reanimated/plugin");

  return {
    presets: [
      "nativewind/babel",
      ["babel-preset-expo", { jsxImportSource: "nativewind" }]
    ],
    plugins,
  };
};
