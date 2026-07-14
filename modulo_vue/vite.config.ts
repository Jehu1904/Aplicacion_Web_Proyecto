/**
 * @file vite.config.ts
 * @description Configuración de Vite para el módulo de Vue 3.
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: '/vue/' , 
  build: {
    outDir: '../dist/vue'
  },
  server: {
    port: 5176,
    strictPort: true
  }
});