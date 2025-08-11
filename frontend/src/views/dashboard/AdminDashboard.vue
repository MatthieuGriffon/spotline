<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAdminStats } from '@/api/stats'
import { useAuthStore } from '@/stores/useAuthStore'
import { BASE_API_URL } from '@/api/config'
import type { AdminStats } from '@/types/admin'
import type { User } from '@/stores/useAuthStore'

type AdminUser = User & { imageUpdatedAt?: string; updatedAt?: string }

const router = useRouter()
const auth = useAuthStore()

// Base origin (si BASE_API_URL finit déjà par /api)
const baseOrigin = BASE_API_URL.replace(/\/api\/?$/, '')

const stats = ref<AdminStats>({
  utilisateurs: { total: 0, bannis: 0 },
  prises: { total: 0, signalees: 0 },
  spots: { total: 0, masques: 0 },
  signalements: 0,
})

const isLoading = ref(true)

const admin = computed<AdminUser | null>(() => (auth.user ? (auth.user as AdminUser) : null))

const avatarSrc = computed<string>(() => {
  const path = admin.value?.imageUrl ?? null
  if (!path) return '/images/default-avatar.png'

  // si l'URL est déjà absolue, on la renvoie telle quelle
  if (/^https?:\/\//i.test(path)) return path

  const k = admin.value?.imageUpdatedAt ?? admin.value?.updatedAt ?? null
  const normalized = path.startsWith('/') ? path : `/${path}`
  const sep = normalized.includes('?') ? '&' : '?'
  return `${baseOrigin}${normalized}${k ? `${sep}t=${encodeURIComponent(k)}` : ''}`
})

// force un refresh <img> uniquement quand l’URL change
const avatarKey = ref(0)
const avatarError = ref(false)

watch(
  () => avatarSrc.value,
  () => {
    avatarError.value = false // on réessaie proprement
    avatarKey.value++ // force le refresh <img>
  },
)
watch(
  () => auth.user?.role,
  (role) => {
    if (role && role !== 'ADMIN') router.replace('/dashboard')
  },
  { immediate: true },
)

function goTo(path: string) {
  router.push(path)
}

async function logout() {
  await auth.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    if (!auth.user) await auth.fetchMe()
    stats.value = await fetchAdminStats()
  } catch (err) {
    console.error('Erreur lors du chargement des statistiques admin :', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="admin-dashboard">
    <h2>Tableau de bord administrateur</h2>

    <!-- HEADER COMPTE ADMIN -->
    <section class="admin-info" aria-labelledby="admin-info-title">
      <div v-if="isLoading" class="admin-info__skeleton">
        <div class="skel skel-avatar"></div>
        <div class="skel skel-line"></div>
        <div class="skel skel-line small"></div>
      </div>

      <div v-else class="admin-info__content">
        <img
          v-if="!avatarError"
          :key="avatarKey"
          :src="avatarSrc"
          :alt="`Avatar de ${admin?.pseudo || 'Administrateur'}`"
          class="admin-avatar"
          loading="lazy"
          @error="avatarError = true"
        />

        <div v-else class="admin-avatar placeholder" aria-hidden="true">
          {{ (admin?.pseudo?.[0] || 'A').toUpperCase() }}
        </div>

        <h3 id="admin-info-title">Bonjour {{ admin?.pseudo || 'Administrateur' }}</h3>
        <p class="muted">{{ admin?.email }}</p>

        <div class="admin-actions">
          <button type="button" class="btn" @click="goTo('/profile/info')">
            Modifier mon profil
          </button>
          <button type="button" class="btn" @click="goTo('/profile/password')">
            Changer le mot de passe
          </button>
          <button type="button" class="btn warn" @click="logout">Se déconnecter</button>
        </div>
      </div>
    </section>

    <div v-if="isLoading" class="loading">Chargement des statistiques...</div>

    <template v-else>
      <!-- tes cartes existantes -->
      <div
        class="card"
        role="button"
        aria-label="Accéder à la gestion des utilisateurs"
        @click="goTo('/admin/users')"
      >
        <div class="card-header">
          <font-awesome-icon icon="users" class="card-icon" />
          <div class="card-title">Utilisateurs ({{ stats.utilisateurs.total }})</div>
        </div>
        <div class="card-sub">Bannis : {{ stats.utilisateurs.bannis }}</div>
        <div class="card-action">Gérer les utilisateurs</div>
      </div>

      <div
        class="card"
        role="button"
        aria-label="Accéder à la gestion des prises"
        @click="goTo('/admin/catches')"
      >
        <div class="card-header">
          <font-awesome-icon icon="fish" class="card-icon" />
          <div class="card-title">Prises ({{ stats.prises.total }})</div>
        </div>
        <div class="card-sub">Signalées : {{ stats.prises.signalees }}</div>
        <div class="card-action">Gérer les prises</div>
      </div>

      <div
        class="card"
        role="button"
        aria-label="Accéder à la gestion des spots"
        @click="goTo('/admin/spots')"
      >
        <div class="card-header">
          <font-awesome-icon icon="map" class="card-icon" />
          <div class="card-title">Spots ({{ stats.spots.total }})</div>
        </div>
        <div class="card-sub">Masqués : {{ stats.spots.masques }}</div>
        <div class="card-action">Gérer les spots</div>
      </div>

      <div
        class="card"
        role="button"
        aria-label="Accéder à la liste des signalements à traiter"
        @click="goTo('/admin/reports')"
      >
        <div class="card-header">
          <font-awesome-icon icon="exclamation-triangle" class="card-icon" />
          <div class="card-title">Signalements</div>
        </div>
        <div class="card-sub">{{ stats.signalements }} à traiter</div>
        <div class="card-action">Voir les signalements</div>
      </div>

      <div
        class="card"
        role="button"
        aria-label="Accéder aux statistiques détaillées"
        @click="goTo('/admin/stats')"
      >
        <div class="card-header">
          <font-awesome-icon icon="chart-bar" class="card-icon" />
          <div class="card-title">Statistiques</div>
        </div>
        <div class="card-action">Voir les détails</div>
      </div>

      <div
        class="card"
        role="button"
        aria-label="Gérer les discussions de groupe"
        @click="goTo('/admin/chats')"
      >
        <div class="card-header">
          <font-awesome-icon icon="comments" class="card-icon" />
          <div class="card-title">Chats de groupe</div>
        </div>
        <div class="card-sub">Superviser les discussions en temps réel</div>
        <div class="card-action">Accéder aux salons</div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.admin-dashboard {
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--header-height) - var(--footer-height));
  gap: var(--space-xs);

  h2 {
    font-size: var(--font-lg);
    color: var(--color-text-inverted);
    margin-bottom: var(--space-xs);
    text-align: center;
    line-height: 1.2;
    font-weight: 600;

    &::after {
      content: '';
      display: block;
      margin: var(--space-sm) auto 0;
      width: 3rem;
      height: 0.25rem;
      background-color: var(--color-primary-dark);
      border-radius: var(--radius-md);
    }
  }
}

/* === Header compte admin === */
.admin-info {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-lg) var(--space-md);
  margin-bottom: var(--space-sm);
  text-align: center;

  .admin-info__skeleton {
    display: grid;
    place-items: center;
    gap: var(--space-sm);
    .skel {
      background: var(--color-background-soft);
      border-radius: var(--radius-sm);
      &.skel-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
      }
      &.skel-line {
        width: 60%;
        height: 14px;
      }
      &.skel-line.small {
        width: 40%;
        height: 12px;
      }
    }
  }

  .admin-info__content {
    display: grid;
    justify-items: center;
    gap: var(--space-xs);
  }

  .admin-avatar {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--color-border);
    &.placeholder {
      display: grid;
      place-items: center;
      background: var(--color-background-soft);
      color: var(--color-text-muted);
      font-weight: 700;
      font-size: var(--font-lg);
    }
  }

  h3 {
    font-size: var(--font-base);
    font-weight: 700;
    color: var(--color-text);
  }
  .muted {
    color: var(--color-text-muted);
    font-size: var(--font-xs);
  }

  .admin-actions {
    margin-top: var(--space-sm);
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-xs);

    .btn {
      padding: var(--space-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      font-size: var(--font-xs);
      font-weight: 600;
      color: var(--color-text);
      text-align: center;
      &:active {
        background: var(--color-background-soft);
      }
      &.warn {
        color: var(--color-danger);
        border-color: var(--color-danger);
      }
    }
  }
}

@media (min-width: 768px) {
  .admin-info .admin-actions {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* === Cartes existantes === */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-sm);
  box-shadow: var(--shadow-sm);
  transition: background 0.2s ease;

  &:active {
    background: var(--color-background-soft);
  }

  .card-title {
    font-weight: 600;
    font-size: var(--font-base);
    color: var(--color-text);
    margin-bottom: var(--space-xs);
  }
  .card-sub {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    margin-bottom: var(--space-xs);
  }
  .card-action {
    font-size: var(--font-xs);
    color: var(--color-primary);
    font-weight: 500;
    margin-top: var(--space-xs);
    text-decoration: underline;
  }
}
.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}
.card-icon {
  font-size: 1rem;
  color: var(--color-primary);
  flex-shrink: 0;
}
.card:hover {
  background: var(--color-background-soft);
  cursor: pointer;
}
</style>
