<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import EmailSentModal from '@/components/auth/EmailSentModal.vue'
import { useRouter, useRoute } from 'vue-router'


const emit = defineEmits<{
  (e: 'close'): void
  (e: 'email-sent'): void
}>()

const isRegistering = ref(false)
const email = ref('')
const password = ref('')
const pseudo = ref('')

const authStore = useAuthStore()
const showEmailSentModal = ref(false)

const router = useRouter()
const route = useRoute()

const handleSubmit = async () => {
  if (isRegistering.value) {
    await authStore.register(email.value, pseudo.value, password.value)
    if (authStore.successMessage?.includes('Vérifie ta boîte mail')) {
      emit('close')
      emit('email-sent')
    }
  } else {
    await authStore.login(email.value, password.value)

    if (authStore.user) {
      console.log('[DEBUG] Redirection, rôle =', authStore.user.role)
      emit('close')

      const role = authStore.user.role.toLowerCase()
      const fallback = role === 'admin' ? '/admin' : '/dashboard'

      // 1) on respecte ?redirect=... si présent
      const q = (route.query.redirect as string | undefined) ?? ''
      // 2) on ne fait confiance qu’aux chemins internes
      const target = q && q.startsWith('/') ? q : fallback

      // 3) on remplace l’historique (évite de revenir sur la modale)
      router.replace(target)
    }
  }
}
</script>

<template>
  <div class="auth-modal-backdrop" @click.self="emit('close')" aria-modal="true" role="dialog">
    <div class="auth-modal-card">
      <button class="auth-close-btn" @click="emit('close')" aria-label="Fermer">✕</button>

      <div class="auth-modal-content">
        <h2>{{ isRegistering ? 'Créer un compte' : 'Connexion' }}</h2>

        <form @submit.prevent="handleSubmit">
          <template v-if="isRegistering">
            <label>
              Pseudo
              <input v-model="pseudo" type="text" placeholder="Ton pseudo" required />
            </label>
          </template>

          <label>
            Adresse email
            <input v-model="email" type="email" placeholder="ton@email.com" required />
          </label>

          <label>
            Mot de passe
            <input v-model="password" type="password" placeholder="Mot de passe" required />
          </label>

          <button type="submit" class="auth-submit-btn" :disabled="authStore.isLoading">
            {{ isRegistering ? "S'inscrire" : 'Se connecter' }}
          </button>
        </form>

        <p v-if="authStore.errorMessage" class="auth-error">
          {{ authStore.errorMessage }}
        </p>

        <p
  v-if="authStore.successMessage && !showEmailSentModal"
  class="auth-success"
>
  {{ authStore.successMessage }}
</p>

        <p class="auth-switch">
          <span>{{ isRegistering ? 'Déjà un compte ?' : 'Pas encore inscrit ?' }}</span>
          <button type="button" @click="isRegistering = !isRegistering">
            {{ isRegistering ? 'Connexion' : 'Créer un compte' }}
          </button>
        </p>
      </div>
    </div>
  </div>
  <EmailSentModal v-if="showEmailSentModal" @close="showEmailSentModal = false" />
</template>

<style scoped src="../styles/AuthModal.scss" lang="scss" />
