<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isRegistering = ref(false)
</script>

<template>
  <div class="auth-modal-backdrop" @click.self="emit('close')" aria-modal="true" role="dialog">
    <div class="auth-modal-card">
      <button class="auth-close-btn" @click="emit('close')" aria-label="Fermer">✕</button>

      <div class="auth-modal-content">
        <h2>{{ isRegistering ? 'Créer un compte' : 'Connexion' }}</h2>

        <form @submit.prevent>
          <template v-if="isRegistering">
            <label>
              Pseudo
              <input type="text" placeholder="Ton pseudo" required />
            </label>
          </template>

          <label>
            Adresse email
            <input type="email" placeholder="ton@email.com" required />
          </label>

          <label>
            Mot de passe
            <input type="password" placeholder="Mot de passe" required />
          </label>

          <button type="submit" class="auth-submit-btn">
            {{ isRegistering ? "S'inscrire" : 'Se connecter' }}
          </button>
        </form>

        <p class="auth-switch">
          <span>{{ isRegistering ? 'Déjà un compte ?' : 'Pas encore inscrit ?' }}</span>
          <button type="button" @click="isRegistering = !isRegistering">
            {{ isRegistering ? 'Connexion' : 'Créer un compte' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped src="../styles/AuthModal.scss" lang="scss" />
