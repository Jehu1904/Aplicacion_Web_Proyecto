/**
 * @file index.ts
 * @description Enrutador centralizado para la navegación SPA de Vue.
 * Usa Hash History para compatibilidad con subcarpetas
 */
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import DetalleCitaView from '../views/DetalleCitaView.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Dashboard',
        component: (): Promise<any> => import('../views/DashboardView.vue')
    },
    {
        path: '/detalle/:id',
        name: 'DetalleCita',
        component: (): Promise<any> => import('../views/DetalleCitaView.vue'),
        props: true
    },
    {
        path: '/perfil',
        name: 'Perfil',
        component: (): Promise<any> => import('../views/PerfilView.vue')
    },
    {
        path: '/historial',
        name: 'Historial',
        component: (): Promise<any> => import('../views/HistorialView.vue')
    }
];

const router = createRouter({
    history: createWebHashHistory('/vue/'),
    routes
});

export default router;