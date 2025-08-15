<script setup lang="ts">
import { watch, computed, ref, onMounted } from 'vue'
import { useInvitationsStore } from '@/stores/invitationsStore'
import { useAuthStore } from '@/stores/useAuthStore'

const auth = useAuthStore()
const invitations = useInvitationsStore()
const recentJoin = ref<{ groupName: string } | null>(null)

function checkRecentJoin() {
  const stored = localStorage.getItem('inviteAcceptedBanner')
  if (stored) {
    try {
      const data: { groupName: string; ts: number } = JSON.parse(stored)
      if (Date.now() - data.ts < 15000) {
        recentJoin.value = { groupName: data.groupName }
      }
    } catch {
      console.warn('Données bannière récentes invalides')
    }
    localStorage.removeItem('inviteAcceptedBanner')
  }
}

watch(
  () => auth.user,
  async (user) => {
    if (user) {
      try {
        await invitations.loadMine()
      } catch (e) {
        console.warn('[BannerInvitations] loadMine failed', e)
      }
      checkRecentJoin()
    }
  },
  { immediate: true }
)

const pending = computed(() =>
  invitations.myInvitations.filter(i => i.status === 'PENDING')
)

onMounted(() => {
  if (auth.user) checkRecentJoin()
})

async function act(id: string, action: 'accept' | 'decline') {
  await invitations.actDirect(id, action)
}
</script>

<template>
  <!-- 🎉 Message après lien/QR -->
  <div v-if="recentJoin" class="banner-invites success">
    Tu as rejoint le groupe <strong>{{ recentJoin.groupName }}</strong> !
  </div>

  <!-- 📩 Invitations classiques -->
  <div v-if="pending.length" class="banner-invites">
    <div class="title">
      Tu as {{ pending.length }} invitation{{ pending.length > 1 ? 's' : '' }} en attente
    </div>
    <ul>
      <li v-for="i in pending" :key="i.id" class="item">
        <span class="name">{{ i.groupName }}</span>
        <button class="btn primary" @click="act(i.id, 'accept')">Accepter</button>
        <button class="btn" @click="act(i.id, 'decline')">Refuser</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.banner-invites {
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 8px;
  padding: .5rem .75rem;
  margin: .5rem 0;
}
.banner-invites.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}
.item {
  display: flex;
  gap: .5rem;
  align-items: center;
  justify-content: space-between;
  padding: .35rem 0;
}
.name {
  font-weight: 600;
}
.btn {
  padding: .4rem .6rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #f3f4f6;
}
.btn.primary {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
</style>
