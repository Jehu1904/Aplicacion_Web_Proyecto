/**
 * @file vite.config.ts
 * @description Configuración de Vite para el módulo de Vue 3.
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  // ¡ESTA LÍNEA ES LA CLAVE!
  // Le dice a Vite: "cuando cargues archivos, busca desde esta ruta relativa"
  base: '/modulo_vue/' , 
  server: {
    port: 5176,
    strictPort: true
  }
});