<script setup lang="ts">
import { ref, computed } from 'vue'
import { changePassword } from '@/api/authPassword'
import { useAuthStore } from '@/stores/useAuthStore'

const auth = useAuthStore()
const oldPwd = ref('')
const newPwd = ref('')
const newPwd2 = ref('')
const loading = ref(false)
const error = ref<string|null>(null)
const success = ref<string|null>(null)

const canSubmit = computed(() =>
  oldPwd.value.length >= 6 &&
  newPwd.value.length >= 8 &&
  newPwd.value === newPwd2.value
)

async function onSubmit() {
  error.value = null
  success.value = null
  loading.value = true
  try {
    await changePassword(oldPwd.value, newPwd.value)
    success.value = 'Mot de passe changé.'
    oldPwd.value = newPwd.value = newPwd2.value = ''
    await auth.fetchMe()
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'message' in e) {
      error.value = (e as { message?: string }).message || 'Erreur lors du changement de mot de passe'
    } else {
      error.value = 'Erreur lors du changement de mot de passe'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="pwd-wrapper">
    <h2>Changer mon mot de passe</h2>

    <form @submit.prevent="onSubmit">
      <label>Mot de passe actuel
        <input v-model="oldPwd" type="password" autocomplete="current-password" required />
      </label>

      <label>Nouveau mot de passe
        <input v-model="newPwd" type="password" autocomplete="new-password" required />
      </label>

      <label>Confirmer le nouveau
        <input v-model="newPwd2" type="password" autocomplete="new-password" required />
      </label>

      <p class="hint">8+ caractères, idéalement majuscules, chiffres et symbole.</p>

      <button :disabled="!canSubmit || loading" type="submit">
        {{ loading ? 'En cours…' : 'Mettre à jour' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </form>
  </div>
</template>
<style scoped lang="scss">
.pwd-wrapper {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  color: #fff; // <-- texte blanc par défaut

  h2 {
    color: #fff;
    text-align: center;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin: .75rem 0;
    color: #fff;
  }

  input {
    width: 100%;
    padding: .6rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: transparent; // garde fond transparent si besoin
    color: #fff;
  }

  input::placeholder {
    color: rgba(255,255,255,0.7); // placeholder blanc/grisé
  }

  button[disabled] {
    opacity: .6;
  }

  button {
    color: #fff; // texte du bouton en blanc
  }

  .error {
    color: #ff6b6b; // rouge clair sur fond sombre
  }

  .success {
    color: #4ade80; // vert clair
  }

  .hint {
    font-size: .9rem;
    color: rgba(255,255,255,0.7);
  }
}
</style>