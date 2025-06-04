module.exports = function (api) {
  api.cache(true);
  // const isAndroid = process.env.PLATFORM === "android";
  // console.log("Babel configuration loaded.");
  return {
    presets: ["babel-preset-expo"],
    // plugins: [
    //   [
    //     "module-resolver",
    //     {
    //       alias: isAndroid
    //         ? {
    //             "react-native-google-mobile-ads": "./src/utils/EmptyStub.js",
    //             "@react-native-google-signin/google-signin": "./src/utils/EmptyStub.js",
    //           }
    //         : {},
    //     },
    //   ],
    // ],
  };
};
