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
    strictPort: true,
    proxy: {
      '/react': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        ws: true
      },
      '/vue': {
        target: 'http://localhost:5176',
        changeOrigin: true,
        ws: true
      },
      '/angular': {
        target: 'http://localhost:4200',
        changeOrigin: true,
        ws: true
      }
    }
  }
})
