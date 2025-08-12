import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/dashboard',
      name: 'UserDashboard',
      component: () => import('@/views/dashboard/UserDashboard.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: () => import('@/views/dashboard/AdminDashboard.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/map',
      name: 'MapView',
      component: () => import('@/views/map/MapView.vue'),
    },
    {
      path: '/catches',
      name: 'CatchesView',
      component: () => import('@/views/catches/CatchesView.vue'),
    },
    {
      path: '/groups',
      name: 'GroupsView',
      component: () => import('@/views/groups/GroupsView.vue'),
    },
    {
      path: '/sessions',
      name: 'SessionsView',
      component: () => import('@/views/sessions/SessionsView.vue'),
    },
    {
      path: '/profile/info',
      name: 'ProfileInfoView',
      component: () => import('@/views/profile/ProfileInfoView.vue'),
    },
    {
      path: '/admin/users',
      name: 'AdminUsers',
      component: () => import('@/views/admin/AdminUsersView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/catches',
      name: 'AdminCatches',
      component: () => import('@/views/admin/AdminCatchesView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/spots',
      name: 'AdminSpots',
      component: () => import('@/views/admin/AdminSpotsView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/reports',
      name: 'AdminReports',
      component: () => import('@/views/admin/AdminReportsView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/stats',
      name: 'AdminStats',
      component: () => import('@/views/admin/AdminStatsView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/chats',
      name: 'AdminChats',
      component: () => import('@/views/admin/AdminChatsView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/auth/confirm/:token?',
      name: 'AuthConfirm',
      component: () => import('@/views/authconfirm/AuthConfirmView.vue'),
    },

    {
      path: '/confirm-password-change/:token',
      name: 'confirm-password-change',
      component: () => import('@/views/ConfirmPasswordChange/ConfirmPasswordChangeView.vue'),
      meta: { requiresAuth: false }, // on confirme souvent déconnecté
    },
    {
      path: '/profile/password',
      name: 'profile-password',
      component: () => import('@/views/ProfilePassword/ProfilePasswordView.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/groupes', name: 'groups-list', component: () => import('@/views/groups/GroupsView.vue') },
    {
      path: '/groupes/nouveau',
      name: 'group-new',
      component: () => import('@/views/groups/GroupsView.vue'),
    }, // si tu l’as
    {
      path: '/groupes/:id',
      name: 'group-detail',
      component: () => import('@/views/groups/GroupDetailView.vue'),
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound/NotFound.vue'),
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  // 1) Hydrate l'user si inconnu
  if (!auth.user) {
    try {
      await auth.fetchMe()
    } catch {
      /* ignore */
    }
  }

  const user = auth.user
  const role = user?.role?.toLowerCase()
  const requiredRole = String(to.meta.role || '').toLowerCase()
  const requiresAuth = Boolean(to.meta.requiresAuth)

  console.debug(
    '[DEBUG] Navigation vers',
    to.path,
    '| rôle utilisateur :',
    role,
    '| attendu :',
    requiredRole,
    '| requiresAuth :',
    requiresAuth,
  )

  // 2) Auth requise ?
  if (requiresAuth && !user) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // 3) Protection des routes admin explicites
  if (to.path.startsWith('/admin')) {
    if (!user) return next({ path: '/login', query: { redirect: to.fullPath } })
    if (role !== 'admin') return next('/dashboard')
  }

  // 4) Règle "role" optionnelle par meta (facultatif, pour d’autres sections)
  if (requiredRole && role !== requiredRole) {
    // Redirige vers le bon tableau de bord selon le rôle connu
    return next(role === 'admin' ? '/admin' : '/dashboard')
  }

  // 5) Si déjà connecté et on va sur /login, redirige vers le bon dashboard
  if (to.path === '/login' && user) {
    return next(role === 'admin' ? '/admin' : '/dashboard')
  }

  return next()
})

export default router
