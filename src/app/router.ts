import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '@/shared/stores/auth.store'
export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', component: () => import('@/pages/LandingPage.vue') },
    ...['login', 'register', 'forgot-password', 'reset-password', 'verify-email'].map((mode) => ({
      path: `/${mode}`,
      component: () => import('@/pages/AuthPage.vue'),
      props: { mode },
      meta: { guest: mode === 'login' || mode === 'register' },
    })),
    { path: '/auth/verify-email', redirect: (to) => ({ path: '/verify-email', query: to.query }) },
    {
      path: '/app',
      component: () => import('@/pages/AppShell.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/app/servers' },
        { path: 'servers', component: () => import('@/pages/DashboardPage.vue') },
        {
          path: 'servers/:serverId',
          component: () => import('@/pages/ServerDetailPage.vue'),
          props: true,
        },
        {
          path: 'settings/notifications',
          component: () => import('@/pages/NotificationSettingsPage.vue'),
        },
        { path: 'settings/integrations', component: () => import('@/pages/IntegrationsPage.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
})
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !authStore().isAuthenticated) return '/login'
  if (to.meta.guest && authStore().isAuthenticated) return '/app/servers'
})
