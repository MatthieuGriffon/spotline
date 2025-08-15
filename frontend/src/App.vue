<script setup lang="ts">
import Layout from '@/components/layout/Layout.vue'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { checkPendingInvite } from '@/utils/checkPendingInvite'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

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
  <Layout />
</template>




