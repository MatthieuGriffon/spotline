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
},
  {
      path: '/map',
      name: 'MapView',
      component: () => import('@/views/map/MapView.vue')
    },
    {
      path: '/catches',
      name: 'CatchesView',
      component: () => import('@/views/catches/CatchesView.vue')
    },
    {
      path: '/groups',
      name: 'GroupsView',
      component: () => import('@/views/groups/GroupsView.vue')
    },
    {
      path: '/sessions',
      name: 'SessionsView',
      component: () => import('@/views/sessions/SessionsView.vue')
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

  const role = authStore.user?.role?.toLowerCase()
  const requiredRole = String(to.meta.role || '').toLowerCase()

  console.log('[DEBUG] Navigation vers', to.path, '| rôle utilisateur :', role, '| attendu :', requiredRole)

  if (to.meta.role && role !== requiredRole) {
    return next({ name: 'home' })
  }

  return next()
})


export default router
