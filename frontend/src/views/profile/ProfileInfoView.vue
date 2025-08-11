<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { updatePseudo, uploadAvatar, requestEmailChange } from '@/api/user'
import { useAuthStore } from '@/stores/useAuthStore'
import { BASE_API_URL } from '@/api/config'

const authStore = useAuthStore()

const isLoading = ref(true)
const isSaving = ref(false)
const isSendingEmail = ref(false)

const error = ref<string | null>(null)
const feedback = ref<string | null>(null)

const pseudo = ref('')
const email = ref('')
const newEmail = ref('')
const isConfirmed = ref(false)

const avatarUrl = ref<string | null>(null) // affichée
const avatarFile = ref<File | null>(null) // source brute
let previewObjectUrl: string | null = null // pour revoke

const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5 Mo (MVP)
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

onMounted(async () => {
  try {
    await authStore.fetchMe()

    if (authStore.user) {
      pseudo.value = authStore.user.pseudo
      email.value = authStore.user.email
      isConfirmed.value = authStore.user.isConfirmed
      console.log('[DEBUG] imageUrl brut:', authStore.user.imageUrl)

      avatarUrl.value = authStore.user.imageUrl
        ? `${BASE_API_URL.replace('/api', '')}${authStore.user.imageUrl}?t=${Date.now()}`
        : null
    }
  } catch (e) {
    error.value = 'Impossible de charger le profil pour le moment.'
    console.error('[ERREUR FETCH ME]', e)
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl)
    previewObjectUrl = null
  }
})

const canSave = computed(() => {
  const pseudoChanged =
    authStore.user && pseudo.value.trim() && pseudo.value.trim() !== authStore.user.pseudo
  return Boolean(pseudoChanged || avatarFile.value)
})
async function saveProfile() {
  if (!canSave.value) {
    feedback.value = 'Aucune modification à enregistrer.'
    return
  }

  isSaving.value = true
  feedback.value = null
  error.value = null

  try {
    const ops: Promise<unknown>[] = []
    const baseUrl = BASE_API_URL.replace('/api', '')
    const nextPseudo = pseudo.value.trim()

    if (authStore.user && nextPseudo && nextPseudo !== authStore.user.pseudo) {
      ops.push(updatePseudo(nextPseudo))
    }

    if (avatarFile.value) {
      const formData = new FormData()
      formData.append('avatar', avatarFile.value)
      ops.push(uploadAvatar(formData))
    }

    if (ops.length) {
      await Promise.all(ops)
    }
    await authStore.fetchMe()

    if (authStore.user?.imageUrl) {
      avatarUrl.value = `${baseUrl}${authStore.user.imageUrl}?t=${Date.now()}`
    }

    feedback.value = 'Profil mis à jour.'
    avatarFile.value = null
  } catch (err: unknown) {
    console.error('[ERREUR SAVE PROFILE]', err)
    error.value = err instanceof Error ? err.message : 'Échec de la mise à jour du profil.'
  } finally {
    isSaving.value = false
    // Nettoyer l’URL de prévisualisation si besoin (en finally pour couvrir les erreurs)
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl)
      previewObjectUrl = null
    }
  }
}

async function changeEmail() {
  if (!newEmail.value.trim()) {
    feedback.value = 'Renseigne une nouvelle adresse email.'
    return
  }
  isSendingEmail.value = true
  feedback.value = null
  error.value = null
  try {
    await requestEmailChange(newEmail.value.trim())
    feedback.value = 'Un lien de confirmation a été envoyé à cette adresse.'
  } catch (err) {
    error.value = (err as Error).message || 'Impossible d’envoyer le lien pour le moment.'
  } finally {
    isSendingEmail.value = false
  }
}

function onAvatarChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Validation stricte conforme au MVP
  if (!ALLOWED_TYPES.includes(file.type)) {
    error.value = 'Format non supporté. Choisis un JPEG ou un PNG.'
    return
  }
  if (file.size > MAX_AVATAR_SIZE) {
    error.value = 'Image trop lourde (max 5 Mo).'
    return
  }

  avatarFile.value = file

  // Prévisualisation locale
  if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)
  previewObjectUrl = URL.createObjectURL(file)
  avatarUrl.value = previewObjectUrl
}
</script>

<template>
  <div class="profile-wrapper">
    <h2>Mon profil</h2>

    <div v-if="isLoading" class="status">Chargement…</div>
    <div v-else>
      <div v-if="error" class="status error" role="alert">{{ error }}</div>

      <div class="profile-form" v-if="!error">
        <div class="avatar-block">
          <img :src="avatarUrl || '/images/default-avatar.png'" alt="Avatar" class="avatar" />
          <input
            type="file"
            accept="image/png,image/jpeg"
            @change="onAvatarChange"
            :disabled="isSaving"
          />
          <small class="hint">JPEG/PNG, 5 Mo max.</small>
        </div>

        <label for="pseudo">Pseudo</label>
        <input id="pseudo" type="text" v-model="pseudo" :disabled="isSaving" />

        <label for="email">
          Email actuel
          <span v-if="isConfirmed" class="badge">confirmé</span>
          <span v-else class="badge warn">non confirmé</span>
        </label>
        <input id="email" type="email" :value="email" disabled />

        <label for="newEmail">Changer d’email</label>
        <div class="row">
          <input
            id="newEmail"
            type="email"
            v-model="newEmail"
            :disabled="isSendingEmail || isSaving"
          />
          <button type="button" @click="changeEmail" :disabled="isSendingEmail || !newEmail">
            {{ isSendingEmail ? 'Envoi…' : 'Envoyer le lien de confirmation' }}
          </button>
        </div>
        <section class="section-block actions">
          <div class="cards">
            <router-link to="/profile/password" class="card" aria-label="Changer mon mot de passe">
              <font-awesome-icon icon="key" class="icon" aria-hidden="true" />
              <div class="content">
                <div class="title">Changer mon mot de passe</div>
                <div class="subtitle">Met à jour ton mot de passe en toute sécurité</div>
                <div class="cta">Accéder</div>
              </div>
            </router-link>
          </div>
        </section>
        <button class="primary" @click="saveProfile" :disabled="isSaving || !canSave">
          {{ isSaving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>

        <p class="feedback" v-if="feedback" aria-live="polite" role="status">{{ feedback }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile-wrapper {
  padding: var(--space-md);
  color: var(--color-text);

  h2 {
    font-size: var(--font-title);
    font-weight: bold;
    text-align: center;
    margin-bottom: var(--space-lg);
    color: var(--color-text-inverted); // 🔹 blanc
  }
}

.status {
  font-style: italic;
  text-align: center;
  &.error {
    color: var(--color-error);
    font-weight: 500;
  }
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  background: var(--color-surface);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);

  label {
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: var(--space-sm);

    .badge {
      font-size: var(--font-xs);
      padding: 0.1rem 0.4rem;
      border-radius: var(--radius-sm);
      background: var(--color-success);
      color: var(--color-text-inverted);

      &.warn {
        background: var(--color-warning);
      }
    }
  }

  .row {
    display: flex;
    gap: var(--space-sm);
    align-items: center;

    @media (max-width: 400px) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  input[type='text'],
  input[type='email'] {
    padding: 0.6rem;
    font-size: var(--font-base);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    background: var(--color-surface);

    &:disabled {
      opacity: 0.6;
    }
  }

  button {
    padding: 0.6rem;
    font-size: var(--font-base);
    border-radius: var(--radius-md);
    border: none;
    background-color: var(--color-primary);
    color: var(--color-text-inverted);
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
      background-color: var(--color-primary-hover);
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .avatar-block {
    display: flex;
    flex-direction: column;
    align-items: center;

    .avatar {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: var(--space-sm);
      border: 2px solid var(--color-border);
    }

    input[type='file'] {
      font-size: var(--font-sm);
    }
    .hint {
      font-size: var(--font-xs);
      opacity: 0.8;
    }
  }

  .feedback {
    font-style: italic;
    color: var(--color-success);
    text-align: center;
  }
  .profile-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin-top: var(--space-md);

    .btn {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      font-weight: 500;
      color: var(--color-text);
      text-decoration: none;
      &:hover {
        background: var(--color-background-soft);
      }
      &.secondary {
        color: var(--color-primary);
        border-color: var(--color-primary);
      }
    }
  }
}
.section-block {
  margin-bottom: 2rem;

  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: #222;
  }
}

.actions .cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 600px) {
  .actions .cards {
    grid-template-columns: 1fr 1fr;
  }
}

.card {
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: 1rem;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 1rem;
  text-decoration: none;
  transition: background 0.2s ease;

  &:hover { background: #e2e8f0; }

  .icon {
    font-size: 1.5rem;
    color: #0d9488;
    flex-shrink: 0;
  }

  .content {
    .title { font-weight: 600; color: #1f2937; }
    .subtitle { font-size: 0.9rem; color: #6b7280; }
    .cta { font-size: 0.8rem; color: #0d9488; text-decoration: underline; }
  }
}

.card:focus-visible {
  outline: 3px solid #0d9488;
  outline-offset: 2px;
}
</style>
