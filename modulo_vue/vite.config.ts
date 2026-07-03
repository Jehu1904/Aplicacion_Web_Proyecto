/**
 * @file vite.config.ts
 * @description Archivo de configuración simplificado de Vite para el módulo de Vue 3.
 * Utiliza plugins oficiales estándar para evitar conflictos de rutas.
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'; // Importación del plugin oficial de Vue

export default defineConfig({
  // Registramos el plugin oficial para compilar los componentes .vue
  plugins: [vue()],
  
  server: {
    // Forzamos el puerto exclusivo para tu exposición de Vue 3
    port: 5176,
    strictPort: true
  }
});