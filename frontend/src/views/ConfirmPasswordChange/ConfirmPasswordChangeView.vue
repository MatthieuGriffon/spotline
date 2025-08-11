<!-- src/views/Auth/ConfirmPasswordChangeView.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { confirmPasswordChange } from '@/api/authPassword'
import { useAuthStore } from '@/stores/useAuthStore'


const route = useRoute()
const router = useRouter()
const status = ref<'loading'|'ok'|'error'>('loading')
const message = ref('Confirmation en cours…')
const auth = useAuthStore()

onMounted(async () => {
  const token = String(route.params.token || '')
  if (!token) {
    status.value = 'error'
    message.value = 'Token manquant.'
    return
  }
  try {
    await confirmPasswordChange(token)
    status.value = 'ok'
    message.value = 'Mot de passe confirmé. Tu peux te connecter.'
    // Optionnel: rediriger après 2s
    auth.setUser(null)
    router.replace({ path: '/', query: { notice: 'password-changed' } }) 
  } catch (e: unknown) {
    status.value = 'error'
    if (e && typeof e === 'object' && 'message' in e) {
      // @ts-expect-error: We are checking for message property
      message.value = e.message || 'Lien invalide ou expiré.'
    } else {
      message.value = 'Lien invalide ou expiré.'
    }
  }
})
</script>

<template>
  <div class="confirm-wrapper" :data-status="status">
    <h2>Confirmation du mot de passe</h2>
    <p>{{ message }}</p>
    <router-link v-if="status==='ok'" to="/login">Aller à la connexion</router-link>
  </div>
</template>

<style scoped lang="scss">
.confirm-wrapper {
  max-width: 640px; margin: 2rem auto; padding: 1.25rem;
  border: 1px solid var(--color-border); border-radius: 12px;
  background: var(--color-surface); text-align: center;
  &[data-status="loading"] { opacity: .8; }
  &[data-status="ok"] { border-color: var(--color-primary); }
  &[data-status="error"] { border-color: var(--color-danger); }
  h2 { margin-bottom: .75rem; }
}
</style>
