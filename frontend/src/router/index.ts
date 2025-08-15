import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { checkPendingInvite } from '@/utils/checkPendingInvite'

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
    {
      path: '/groupes',
      name: 'groups-list',
      component: () => import('@/views/groups/GroupsView.vue'),
    },
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
    {
      path: '/invite/:token',
      name: 'invite',
      component: () => import('@/views/inviteView/InviteView.vue'),
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  // 1️⃣ Hydrate user si pas encore fait
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

  // 2️⃣ Gestion des liens d'invitation directs
  if (to.name === 'invite' && typeof to.params.token === 'string') {
    const token = to.params.token
    const expires = Date.now() + 1000 * 60 * 10 // 10 min

    if (!user) {
      // 🔹 Pas connecté → on stocke et on redirige vers /
      localStorage.setItem('pendingInvite', JSON.stringify({ token, expires }))
      return next({ path: '/', query: { redirect: '/' } })
    } else {
      // 🔹 Déjà connecté → traite immédiatement
      const groupId = await checkPendingInvite(token) // ✅ on passe le token
      if (groupId) return next(`/groupes/${groupId}`)
      return next('/groups') // fallback si token invalide
    }
  }

  // 3️⃣ Cas où l’utilisateur vient de se connecter et a un token stocké
  if (user && localStorage.getItem('pendingInvite')) {
    const groupId = await checkPendingInvite()
    if (groupId) return next(`/groupes/${groupId}`)
  }

  // 4️⃣ Auth requise ?
  if (requiresAuth && !user) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // 5️⃣ Routes admin
  if (to.path.startsWith('/admin')) {
    if (!user) return next({ path: '/login', query: { redirect: to.fullPath } })
    if (role !== 'admin') return next('/dashboard')
  }

  // 6️⃣ Vérif du role
  if (requiredRole && role !== requiredRole) {
    return next(role === 'admin' ? '/admin' : '/dashboard')
  }

  // 7️⃣ Si déjà connecté et on va sur /login
  if (to.path === '/login' && user) {
    return next(role === 'admin' ? '/admin' : '/dashboard')
  }

  return next()
})



export default router
