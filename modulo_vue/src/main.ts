/**
 * @file main.ts
 * @description Punto de entrada para el módulo Vue 3
 * Verifica autenticación desde localStorage (compartida con contenedora)
 */
import { createApp, App as VueApp } from 'vue';
import App from './App.vue';
import router from './router';

// Verificar autenticación antes de cargar
const token = localStorage.getItem('token');
if (!token) {
  // Si no hay token, redirigir a la contenedora
  window.location.href = '/';
} else {
  // Instanciación del framework
  const app: VueApp = createApp(App);

  // Acoplar el sistema de rutas
  app.use(router);

  // Montar la aplicación
  app.mount('#app');
}