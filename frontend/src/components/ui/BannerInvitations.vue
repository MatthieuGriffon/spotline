<script setup lang="ts">
import { watch, computed } from 'vue'
import { useInvitationsStore } from '@/stores/invitationsStore'
import { useAuthStore } from '@/stores/useAuthStore'

const auth = useAuthStore()
const invitations = useInvitationsStore()

watch(
  () => auth.user,
  async (user) => {
    if (user) {
      try {
        await invitations.loadMine()
        // debug
        console.debug('[BannerInvitations] myInvitations ->', invitations.myInvitations)
      } catch (e) {
        console.warn('[BannerInvitations] loadMine failed', e)
      }
    }
  },
  { immediate: true }
)

const pending = computed(() =>
  invitations.myInvitations.filter(i => i.status === 'PENDING')
)

async function act(id: string, action: 'accept' | 'decline') {
  await invitations.actDirect(id, action)
}
</script>

<template>
  <div v-if="pending.length" class="banner-invites">
    <div class="title">Tu as {{ pending.length }} invitation{{ pending.length>1?'s':'' }} en attente</div>
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
.banner-invites{background:#fff3cd;border:1px solid #ffeeba;border-radius:8px;padding:.5rem .75rem;margin:.5rem}
.item{display:flex;gap:.5rem;align-items:center;justify-content:space-between;padding:.35rem 0}
.name{font-weight:600}
.btn{padding:.4rem .6rem;border-radius:6px;border:1px solid #d1d5db;background:#f3f4f6}
.btn.primary{background:#2563eb;color:#fff;border-color:#2563eb}
</style>
