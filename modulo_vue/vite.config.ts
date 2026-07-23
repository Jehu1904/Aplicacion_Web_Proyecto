/**
 * @file vite.config.ts
 * @description Configuración de Vite para el módulo de Vue 3.
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [vue()],
  base: '/vue/' , 
  build: {
    outDir: resolve(__dirname, '../dist/vue')
  },
  server: {
    port: 5176,
    strictPort: true
  }
});