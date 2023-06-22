// vite.config.ts
import { defineConfig } from 'vite';
// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'sdk',
      fileName: 'sdk',
    },
  },
});
