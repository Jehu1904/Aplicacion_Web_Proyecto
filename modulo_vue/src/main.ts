/**
 * @file main.ts
 * @description Punto de entrada exclusivo para el módulo de Vue 3.
 * Inicializa la aplicación y conecta el enrutador dinámico.
 */
import { createApp, App as VueApp } from 'vue';
import App from './App.vue';
import router from './router';

// Instanciación del framework en su entorno aislado
const app: VueApp = createApp(App);

// Acoplamos el sistema de rutas dinámicas de Vue
app.use(router);

// Montamos la aplicación sobre el contenedor del HTML local
app.mount('#app');