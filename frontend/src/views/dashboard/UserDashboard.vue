<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchUserDashboard } from '@/api/dashboard'
import type { UserDashboardResponseType } from '@/types/dashboard'
import { BASE_API_URL } from '@/api/config'

const dashboardData = ref<UserDashboardResponseType | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const fmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })
const formatDate = (iso: string) => fmt.format(new Date(iso))

const baseOrigin = BASE_API_URL.replace('/api', '') // si pas déjà défini

const avatarSrc = computed(() => {
  const path = dashboardData.value?.user?.imageUrl ?? null
  if (!path) return '/images/default-avatar.png'

  const k: string | null =
    dashboardData.value?.user?.imageUpdatedAt ??
    dashboardData.value?.user?.updatedAt ??
    null

  const sep = path.includes('?') ? '&' : '?'
  return `${baseOrigin}${path}${k ? `${sep}t=${encodeURIComponent(k)}` : ''}`
})

const actionCards = [
  {
    title: 'Mon compte',
    subtitle: 'Modifier mon pseudo, mon email ou mon mot de passe',
    cta: 'Gérer mon profil',
    icon: 'user-circle',
    link: '/profile/info',
  },
  {
    title: 'Mes prises',
    subtitle: 'Voir toutes mes prises',
    cta: 'Accéder',
    icon: 'fish',
    link: '/catches', // anciennement "/prises"
  },
  {
    title: 'Mes sessions',
    subtitle: 'Mes prochaines sessions de pêche',
    cta: 'Voir les sessions',
    icon: 'calendar-alt',
    link: '/sessions',
  },
  {
    title: 'Mes groupes',
    subtitle: 'Accéder à mes groupes de pêche',
    cta: 'Voir les groupes',
    icon: 'users',
    link: '/groups', // anciennement "/groupes"
  },
  {
    title: 'Carte interactive',
    subtitle: 'Explorer les spots sur la carte',
    cta: 'Voir la carte',
    icon: 'map',
    link: '/map', // anciennement "/carte"
  },
]
onMounted(async () => {
  isLoading.value = true
  error.value = null

  try {
    dashboardData.value = await fetchUserDashboard()
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="dashboard-wrapper">
    <div v-if="isLoading" class="skeleton">
      <div class="skel skel-title"></div>
      <div class="skel skel-card" v-for="i in 4" :key="i"></div>
    </div>
    <div v-else-if="error" class="status error">{{ error }}</div>

    <div v-else-if="dashboardData">
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
        class="dashboard-animated"
      >
        <section class="user-info">
          <h2>Bienvenue {{ dashboardData.user.pseudo }}</h2>
          <p>Heureux de te revoir sur Spotline.</p>
          <img
            loading="lazy"
            :src="avatarSrc"
            :alt="`Avatar de ${dashboardData.user.pseudo}`"
            class="avatar"
          />
        </section>

        <section class="section-block actions">
          <div class="cards">
            <router-link
              v-for="(card, index) in actionCards"
              :key="card.title"
              :to="card.link"
              class="card"
              :aria-label="`${card.title} — ${card.subtitle}`"
              v-motion
              :initial="{ opacity: 0, y: 20, scale: 0.95 }"
              :enter="{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { delay: index * 100, duration: 400 },
              }"
            >
              <font-awesome-icon :icon="card.icon" class="icon" aria-hidden="true" />
              <div class="content">
                <div class="title">{{ card.title }}</div>
                <div class="subtitle">{{ card.subtitle }}</div>
                <div class="cta">{{ card.cta }}</div>
              </div>
            </router-link>

            <router-link
              v-if="
                dashboardData.stats?.sessionsWaitingReply &&
                dashboardData.stats.sessionsWaitingReply > 0
              "
              to="/sessions"
              class="card"
              v-motion
              :initial="{ opacity: 0, y: 20, scale: 0.95 }"
              :enter="{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  delay: actionCards.length * 100,
                  duration: 400,
                },
              }"
            >
              <font-awesome-icon icon="question-circle" class="icon" />
              <div class="content">
                <div class="title">Invitations en attente</div>
                <div class="subtitle">Tu as des invitations à répondre</div>
                <div class="cta">Répondre maintenant</div>
              </div>
            </router-link>
          </div>
        </section>

        <!-- les autres sections restent inchangées -->
        <section class="section-block" v-if="dashboardData.recentGroups.length">
          <h3>Mes groupes récents</h3>
          <ul>
            <li v-for="group in dashboardData.recentGroups" :key="group.id">
              {{ group.name }} ({{ group.role }}) – {{ group.memberCount }} membres
            </li>
          </ul>
        </section>

        <section class="section-block" v-if="dashboardData.recentPrises.length">
          <h3>Mes dernières prises</h3>
          <ul>
            <li v-for="prise in dashboardData.recentPrises" :key="prise.id">
              {{ prise.espece }} –
              <time :datetime="prise.date">{{ formatDate(prise.date) }}</time>
              <span v-if="prise.groupName"> ({{ prise.groupName }})</span>
            </li>
          </ul>
        </section>

        <section class="section-block" v-if="dashboardData.recentSessions.length">
          <h3>Mes sessions récentes</h3>
          <ul>
            <li v-for="session in dashboardData.recentSessions" :key="session.id">
              {{ session.title }} –
              <time :datetime="session.date">{{ formatDate(session.date) }}</time>
              ({{ session.role }})
            </li>
          </ul>
        </section>
        <Motion
          tag="section"
          class="section-block stats"
          v-if="dashboardData.stats"
          :initial="{ opacity: 0, y: 30 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 0.5 } }"
        >
          <h3>Statistiques</h3>

          <div class="stats-table">
            <div class="row">
              <span class="label">🎣 Prises totales</span>
              <span class="value">{{ dashboardData.stats.prisesCount }}</span>
            </div>
            <div class="row">
              <span class="label">👥 Groupes rejoints</span>
              <span class="value">{{ dashboardData.stats.groupsCount }}</span>
            </div>
            <div class="row">
              <span class="label">📅 Sessions à confirmer</span>
              <span class="value">{{ dashboardData.stats.sessionsWaitingReply }}</span>
            </div>
          </div>
        </Motion>
      </div>
    </div>

    <div v-else>
      <div class="status">Aucune donnée disponible.</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard-wrapper {
  max-width: 90%;
  margin: 0.5rem auto;
  padding: 0.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.05);
}
.status {
  font-style: italic;
  color: #666;
  margin: 1rem 0;
  &.error {
    color: red;
  }
}
.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 1rem;

  .avatar {
    margin-top: 0.5rem;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #ccc;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
}
.section-block {
  margin-bottom: 2rem;

  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: #222;
  }

  ul {
    list-style: none;
    padding-left: 0;
    li {
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
    }
  }

  .welcome-message {
    font-style: italic;
    color: #4b5563;
  }
}
.stats p {
  margin: 0.5rem 0;
}
.actions .cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 600px) {
  .actions .cards {
    grid-template-columns: 1fr 1fr;
  }
}

.card {
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: 1rem;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 1rem;
  text-decoration: none;
  transition: background 0.2s ease;

  &:hover {
    background: #e2e8f0;
  }

  .icon {
    font-size: 1.5rem;
    color: #0d9488;
    flex-shrink: 0;
  }

  .content {
    .title {
      font-weight: 600;
      color: #1f2937;
    }

    .subtitle {
      font-size: 0.9rem;
      color: #6b7280;
    }

    .cta {
      font-size: 0.8rem;
      color: #0d9488;
      text-decoration: underline;
    }
  }
}
.card:focus-visible {
  outline: 3px solid #0d9488;
  outline-offset: 2px;
}
.card-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.stats-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;

  .row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background: #f9fafb;
    border-radius: 6px;
    font-size: 0.95rem;

    .label {
      font-weight: 500;
      color: #374151;
    }

    .value {
      font-weight: 600;
      color: #0d9488;
    }
  }
}
.skeleton {
  .skel {
    background: linear-gradient(90deg, #f2f4f7 25%, #e9edf3 37%, #f2f4f7 63%);
    background-size: 400% 100%;
    border-radius: 8px;
    animation: shimmer 1.4s ease infinite;
  }
  .skel-title {
    height: 24px;
    width: 40%;
    margin: 1rem 0;
  }
  .skel-card {
    height: 64px;
    margin: 0.5rem 0;
  }
}
@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
</style>
