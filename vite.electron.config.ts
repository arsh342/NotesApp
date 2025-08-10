import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        main: resolve(__dirname, 'electron/main.ts'),
        preload: resolve(__dirname, 'electron/preload/preload.ts'),
      },
      formats: ['cjs'],
      fileName: (format, entryName) => `${entryName}.cjs`,
    },
    rollupOptions: {
      external: ['electron', 'path', 'fs', 'fs/promises', 'crypto'],
    },
    outDir: 'dist-electron',
    emptyOutDir: true,
    minify: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
