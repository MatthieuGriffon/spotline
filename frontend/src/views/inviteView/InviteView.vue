<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInvitationsStore } from '@/stores/invitationsStore'
import { isNeedsAuth } from '@/types/invitations'

const route = useRoute()
const router = useRouter()
const invitations = useInvitationsStore()

onMounted(async () => {
  const token = route.params.id as string | undefined
  if (!token) {
    router.replace('/')
    return
  }

  try {
    const res = await invitations.act(token, 'accept')
    if (isNeedsAuth(res)) {
      // pas connecté → on envoie vers login avec redirect
      router.replace(`/login?redirect=/invite/${token}`)
      return
    }

    if (res.ok && res.groupId) {
      router.replace(`/groupes/${res.groupId}`)
    } else {
      router.replace('/')
    }
  } catch (err) {
    console.error('[InviteView] erreur act', err)
    router.replace('/')
  }
})
</script>

<template>
  <div class="invite-wrapper">
    <h1>Traitement de l’invitation...</h1>
    <p>Merci de patienter, nous vous redirigeons automatiquement.</p>
  </div>
</template>
