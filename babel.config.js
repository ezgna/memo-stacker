module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // plugins: [
    //   [
    //     "module-resolver",
    //     {
    //       alias: {
    //         "react-native": "react-native-web",
    //         "react-native-google-mobile-ads": "./src/utils/EmptyStub.js",
    //       },
    //     },
    //   ],
    // ],
  };
};
