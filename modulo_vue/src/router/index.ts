/**
 * @file index.ts
 * @description Enrutador centralizado para la navegación SPA de Vue.
 */
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;