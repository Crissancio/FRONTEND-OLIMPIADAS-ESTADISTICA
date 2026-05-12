import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { useAuthStore } from '@/app/stores/auth.store'

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  // Token was cleared externally (e.g. 401 handler)
  if (authStore.token && !localStorage.getItem('access_token')) {
    authStore.clearSession()
  }

  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (!authStore.isAuthenticated) return { name: 'admin-login' }
  }

  if (to.path === '/admin/login' && authStore.isAuthenticated) {
    return { name: 'admin-dashboard' }
  }

  return true
})
