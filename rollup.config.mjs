export default [
  {
    input: 'dist/esm/index.js',
    output: [
      {
        file: 'dist/plugin.js',
        format: 'iife',
        name: 'capacitorYoutubePlayer',
        globals: {
          '@capacitor/core': 'capacitorExports',
        },
        sourcemap: true,
        inlineDynamicImports: true,
      },
      {
        file: 'dist/plugin.cjs.js',
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true,
      },
    ],
    external: ['@capacitor/core', '@webview-native-ui/engine'],
  },
  {
    input: 'dist/esm/projection.js',
    output: {
      file: 'dist/projection.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['@webview-native-ui/engine'],
  },
];