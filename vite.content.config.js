import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist/assets',
    emptyOutDir: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/content/main.jsx'),
      name: 'ToneBridgeContent',
      formats: ['iife'],
      fileName: () => 'content.js',
    },
  },
});
