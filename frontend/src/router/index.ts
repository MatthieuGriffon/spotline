import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
   {
  path: '/dashboard',
  name: 'UserDashboard',
  component: () => import('@/views/dashboard/UserDashboard.vue'),
  meta: { requiresAuth: true, role: 'user' }
},
{
  path: '/admin',
  name: 'AdminDashboard',
  component: () => import('@/views/dashboard/AdminDashboard.vue'),
  meta: { requiresAuth: true, role: 'admin' }
}
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.user) {
    try {
      await authStore.fetchMe()
    } catch {
      // ignore
    }
  }

  // Redirige vers home si l'accès est protégé et pas connecté
  if (to.meta.role && authStore.user?.role.toLowerCase() !== to.meta.role) {
  return next({ name: 'home' })
}

  // Vérifie que le rôle correspond
  if (to.meta.role) {
  const role = authStore.user?.role?.toLowerCase()
  if (!role || role !== to.meta.role) {
    return next({ name: 'home' })
  }
}

  return next()
})

export default router
