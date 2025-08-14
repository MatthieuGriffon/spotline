<script setup lang="ts">
defineOptions({ name: 'AppLayout' });
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AuthModal from '@/components/auth/AuthModal.vue'
import EmailSentModal from '@/components/auth/EmailSentModal.vue'
import EmailConfirmModal from '@/components/ui/EmailConfirmModal.vue'

import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const showAuthModal = ref(false)
const showEmailSentModal = ref(false)
const showConfirmModal = ref(false)
const confirmMessage = ref('')
const confirmStatus = ref<'success' | 'error'>('success')
const redirectPath = ref<string | null>(null)
// Gestion confirmation email
watch(
  () => route.query.token,
  async (token) => {
    if (!token || typeof token !== 'string') return
    try {
      const res = await fetch(`/api/auth/confirm?token=${token}`, {
        method: 'GET',
        credentials: 'include'
      })
      const contentType = res.headers.get('Content-Type') || ''
      const isJson = contentType.includes('application/json')
      const data = isJson ? await res.json() : { message: await res.text() }

      if (!res.ok) throw new Error(data.message || 'Lien invalide ou expiré')
      if (!data.user) throw new Error('Utilisateur introuvable dans la réponse')

      authStore.setUser(data.user)
      redirectPath.value = data.user.role === 'admin' ? '/admin' : '/dashboard'
      confirmStatus.value = 'success'
      confirmMessage.value = 'Ton adresse email a bien été confirmée 🎉'
    } catch (err: unknown) {
      confirmStatus.value = 'error'
      confirmMessage.value = (typeof err === 'object' && err !== null && 'message' in err) ? (err as { message: string }).message : 'Lien invalide ou expiré.'
    } finally {
      showConfirmModal.value = true
      router.replace({ query: { ...route.query, token: undefined } })
    }
  },
  { immediate: true }
)

watch(showAuthModal, value => {
  document.body.style.overflow = value ? 'hidden' : ''
})

function handleConfirmClose() {
  showConfirmModal.value = false
  if (redirectPath.value) router.push(redirectPath.value)
}
</script>

<template>
  <div class="layout">
    <AppHeader @auth-requested="showAuthModal = true" />
   
    <main class="layout-content">
        
      <router-view />
    </main>

    <AppFooter />

    <AuthModal
      v-if="showAuthModal"
      @close="showAuthModal = false"
      @email-sent="showEmailSentModal = true"
    />

    <EmailSentModal
      v-if="showEmailSentModal"
      @close="showEmailSentModal = false"
    />

    <EmailConfirmModal
      v-if="showConfirmModal"
      :message="confirmMessage"
      :status="confirmStatus"
      @close="handleConfirmClose"
    />
  </div>
</template>

<style scoped src="@/components/styles/Layout.scss" lang="scss" />