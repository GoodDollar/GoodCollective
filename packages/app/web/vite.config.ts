import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import dynamicImports from 'vite-plugin-dynamic-import';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dynamicImports(), nodePolyfills(), viteTsconfigPaths()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-svg': 'react-native-svg-web',
      'react-native-webview': 'react-native-web-webview',
    },
    dedupe: ['react', 'ethers', 'react-dom', 'native-base'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true, //handle deps that use "require" and "module.exports"
    },
    rollupOptions: {
      external: ['@react-stately/combobox', '@react-stately/checkbox'], // exclude these deps from the bundle
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.html': 'text', // allow import or require of html files
      },
    },
  },
});
