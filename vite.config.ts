import { defineConfig } from 'vite'

/**
 * Configuración de Vite para la contenedora principal
 * Integra Angular, React y Vue en subcarpetas
 */
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        dir: 'dist'
      }
    }
  },
  server: {
    port: 5173,
    open: true,
    strictPort: true
  }
})
