// vite.config.ts
import { defineConfig } from 'vite';
import pkg from './package.json';
// https://vitejs.dev/guide/build.html#library-mode

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies), // don't bundle dependencies
        ...Object.keys(pkg.peerDependencies),
        /^node:.*/, // don't bundle built-in Node.js modules (use protocol imports!)
      ],
    },
    lib: {
      entry: './src/index.ts',
      name: 'sdk',
      fileName: 'sdk',
    },
  },
  test: {
    testTimeout: 60000,
  },
});
