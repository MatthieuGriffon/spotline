<!-- src/views/AuthConfirmView.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { confirmEmail } from '@/api/user' // cf. fonction ci-dessous

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  const token = (route.params.token as string) || (route.query.token as string)
  if (!token) return router.replace('/auth/login?e=missing_token')

  try {
    await confirmEmail(token)
    // rafraîchir le user pour refléter email/isConfirmed
    await auth.fetchMe()
    router.replace('/profil/mes-infos?confirm=ok')
  } catch {
    router.replace('/auth/login?e=confirm_failed')
  }
})
</script>

<template><div style="padding:1rem;color:#ccc">Confirmation en cours…</div></template>
