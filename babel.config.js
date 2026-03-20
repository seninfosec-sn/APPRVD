module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@constants': './src/constants',
            '@components': './src/components',
            '@types': './src/types',
            '@store': './src/store',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@services': './src/services',
            '@data': './src/data',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
