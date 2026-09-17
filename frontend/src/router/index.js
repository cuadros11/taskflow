import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { titulo: 'Dashboard' },
    },
    {
      path: '/solicitudes',
      name: 'solicitudes',
      component: () => import('../views/RequestsView.vue'),
      meta: { titulo: 'Solicitudes' },
    },
    {
      path: '/solicitudes/nueva',
      name: 'nueva-solicitud',
      component: () => import('../views/NewRequestView.vue'),
      meta: { titulo: 'Nueva solicitud' },
    },
    {
      path: '/solicitudes/:id',
      name: 'detalle-solicitud',
      component: () => import('../views/RequestDetailView.vue'),
      meta: { titulo: 'Detalle de solicitud' },
    },
    {
      path: '/monitor',
      name: 'monitor',
      component: () => import('../views/MonitorView.vue'),
      meta: { titulo: 'Monitor' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
});

export default router;