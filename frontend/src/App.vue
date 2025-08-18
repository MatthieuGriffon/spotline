<script setup lang="ts">
import Layout from '@/components/layout/Layout.vue'
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { checkPendingInvite } from '@/utils/checkPendingInvite'
import { useRouter, useRoute } from 'vue-router'
import AuthModal from '@/components/auth/AuthModal.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// 👉 contrôle du modal d’auth
const showAuthModal = ref(false)

// ouvre automatiquement si ?showAuth=1
watch(
  () => route.query.showAuth,
  (val) => {
    if (val === '1') {
      showAuthModal.value = true
      // on nettoie l’URL après ouverture
      router.replace({ query: { ...route.query, showAuth: undefined } })
    }
  },
  { immediate: true }
)

onMounted(async () => {
  if (authStore.user) {
    const joinedGroupId = await checkPendingInvite()
    if (joinedGroupId) {
      router.replace(`/groupes/${joinedGroupId}`)
    }
  }
})
</script>

<template>
  <!-- Layout reçoit l’emit @auth-requested du header -->
  <Layout @auth-requested="showAuthModal = true" />

  <!-- Modal auth -->
  <AuthModal v-if="showAuthModal" @close="showAuthModal = false" />
</template>




