import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { checkPendingInvite } from '@/utils/checkPendingInvite'
import { useInvitationsStore } from '@/stores/invitationsStore'
import { useBannerStore } from '@/stores/bannerStore'
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
      name: 'InviteLink',
      component: () => import('@/views/inviteView/InviteView.vue'),
    },
    {
      path: '/invitation/:id',
      name: 'invitation-accept',
      component: () => import('@/views/inviteView/InviteView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  const invitationsStore = useInvitationsStore()
  const bannerStore = useBannerStore()

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

  // 2️⃣ Invitation directe (via /invitation/:id)
  if (to.name === 'invitation-accept' && typeof to.params.id === 'string') {
    const invitationId = to.params.id

    if (!user) {
      // Pas connecté → stocker l’invite et ouvrir modal auth
      localStorage.setItem(
        'pendingInvite',
        JSON.stringify({ invitationId, expires: Date.now() + 1000 * 60 * 10 }),
      )
      return next({ path: '/', query: { redirect: to.fullPath, showAuth: '1' } })
    }

    // Déjà connecté → accepte directement
    try {
      const result = await invitationsStore.actDirect(invitationId, 'accept')
      if (result?.ok) {
        if (result.groupName) {
          bannerStore.setRecentJoin(result.groupName) // ✅ on set ici
        }
        return next(result.groupId ? `/groupes/${result.groupId}` : '/groupes')
      }
    } catch (err) {
      console.error('[router guard] Invitation erreur :', err)
    }
    return next('/groupes') // fallback plus logique que /
  }
  // 2bis️⃣ Invitation par lien (via /invite/:token)
  if (to.name === 'InviteLink' && typeof to.params.token === 'string') {
    const token = to.params.token

    if (!user) {
      // Pas connecté → on stocke en localStorage, comme pour l'autre cas
      localStorage.setItem(
        'pendingInvite',
        JSON.stringify({ token, expires: Date.now() + 1000 * 60 * 10 }),
      )
      return next({ path: '/', query: { redirect: to.fullPath, showAuth: '1' } })
    }

    // Si connecté → on appelle l’API pour "actOnInvite" via token
    try {
      const groupId = await checkPendingInvite(token)
      if (groupId) {
        bannerStore.setRecentJoin('Groupe rejoint avec succès') // ou nom récupéré via backend
        return next(`/groupes/${groupId}`)
      }
    } catch (err) {
      console.error('[router guard] InviteLink erreur :', err)
    }
    return next('/groupes') // fallback
  }

  // 3️⃣ Cas "pendingInvite" (après login)
  if (user && localStorage.getItem('pendingInvite')) {
    const stored = JSON.parse(localStorage.getItem('pendingInvite')!)
    localStorage.removeItem('pendingInvite')

    if (stored.invitationId) {
      try {
        const result = await invitationsStore.actDirect(stored.invitationId, 'accept')
        if (result?.ok) {
          if (result.groupName) {
            console.log('[router guard] setRecentJoin appelé avec :', result.groupName)
            bannerStore.setRecentJoin(result.groupName) // ✅ idem ici
          }
          return next(result.groupId ? `/groupes/${result.groupId}` : '/groupes')
        }
      } catch (err) {
        console.error('[router guard] Invitation erreur (pendingInvite):', err)
      }
    }

    if (stored.token) {
      const groupId = await checkPendingInvite(stored.token)
      if (groupId) return next(`/groupes/${groupId}`)
    }
  }

  // 4️⃣ Auth requise
  if (requiresAuth && !user) {
    return next({ path: '/', query: { redirect: to.fullPath, showAuth: '1' } })
  }

  // 5️⃣ Routes admin
  if (to.path.startsWith('/admin')) {
    if (!user) return next({ path: '/', query: { redirect: to.fullPath, showAuth: '1' } })
    if (role !== 'admin') return next('/dashboard')
  }

  // 6️⃣ Vérif role
  if (requiredRole && role !== requiredRole) {
    return next(role === 'admin' ? '/admin' : '/dashboard')
  }

  // 7️⃣ Déjà connecté et on va sur /login → redirect
  if (to.path === '/login' && user) {
    return next(role === 'admin' ? '/admin' : '/dashboard')
  }

  return next()
})




export default router
