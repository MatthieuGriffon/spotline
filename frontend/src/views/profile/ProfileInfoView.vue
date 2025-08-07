<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { updatePseudo, uploadAvatar, requestEmailChange } from '@/api/user'
import { useAuthStore } from '@/stores/useAuthStore'
import { BASE_API_URL } from '@/api/config'
const authStore = useAuthStore()

const isLoading = ref(true)
const error = ref<string | null>(null)
const pseudo = ref('')
const email = ref('')
const newEmail = ref('')
const avatarUrl = ref<string | null>(null)
const avatarFile = ref<File | null>(null)
const isConfirmed = ref(false)
const feedback = ref<string | null>(null)

onMounted(async () => {
  console.debug('[DEBUG] onMounted → fetchMe()')
  await authStore.fetchMe()
  console.debug('[DEBUG] user depuis authStore après fetchMe:', authStore.user)

  if (authStore.user) {
    pseudo.value = authStore.user.pseudo
    email.value = authStore.user.email
    isConfirmed.value = authStore.user.isConfirmed
    console.log('[DEBUG] imageUrl brut de authStore.user:', authStore.user.imageUrl)

    avatarUrl.value = authStore.user.imageUrl
      ? `${BASE_API_URL.replace('/api', '')}${authStore.user.imageUrl}?t=${Date.now()}`
      : null
  }

  isLoading.value = false
})

async function saveProfile() {
  try {
    console.log('[DEBUG] pseudo avant save:', pseudo.value)

    if (pseudo.value) {
      await updatePseudo(pseudo.value)
    }

    if (avatarFile.value) {
      const formData = new FormData()
      formData.append('avatar', avatarFile.value)

      await uploadAvatar(formData)
      await authStore.fetchMe() // mettre à jour authStore.user.imageUrl
    }

    // Refresh avatar URL avec un cache buster
    if (authStore.user?.imageUrl) {
      avatarUrl.value = `${BASE_API_URL.replace('/api', '')}${authStore.user.imageUrl}?t=${Date.now()}`
    }

    feedback.value = 'Profil mis à jour.'
  } catch (err) {
    feedback.value = (err as Error).message
    console.error('[ERREUR SAVE PROFILE]', err)
  }

  avatarFile.value = null
}

async function changeEmail() {
  try {
    await requestEmailChange(newEmail.value)
    feedback.value = 'Un lien de confirmation a été envoyé à cette adresse.'
  } catch (err) {
    feedback.value = (err as Error).message
  }
}

function onAvatarChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    avatarFile.value = file
    avatarUrl.value = URL.createObjectURL(file)
  }
}
</script>

<template>
  <div class="profile-wrapper">
    <h2>Mon profil</h2>

    <div v-if="isLoading" class="status">Chargement…</div>
    <div v-else-if="error" class="status error">{{ error }}</div>

    <div v-else class="profile-form">
      <div class="avatar-block">
        <img :src="avatarUrl || '/images/default-avatar.png'" alt="Avatar" class="avatar" />

        <input type="file" accept="image/png,image/jpeg" @change="onAvatarChange" />
      </div>

      <label for="pseudo">Pseudo</label>
      <input id="pseudo" type="text" v-model="pseudo" />

      <label for="email">Email actuel</label>
      <input id="email" type="email" :value="email" disabled />

      <label for="newEmail">Changer d’email</label>
      <input id="newEmail" type="email" v-model="newEmail" />
      <button type="button" @click="changeEmail">Envoyer un lien de confirmation</button>

      <button class="primary" @click="saveProfile">Enregistrer</button>

      <p class="feedback" v-if="feedback">{{ feedback }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile-wrapper {
  padding: 1rem;
  color: #ccc;
}
.status {
  font-style: italic;
  &.error {
    color: red;
  }
}
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  label {
    font-weight: 500;
  }

  input[type='text'],
  input[type='email'] {
    padding: 0.6rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    color: black;
  }

  button {
    padding: 0.6rem;
    font-size: 1rem;
    border-radius: 6px;
    border: none;
    background-color: #0d9488;
    color: white;
    font-weight: bold;
  }

  .avatar-block {
    display: flex;
    flex-direction: column;
    align-items: center;

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 0.5rem;
      border: 2px solid #ccc;
    }

    input[type='file'] {
      font-size: 0.9rem;
    }
  }

  .feedback {
    font-style: italic;
    color: #0d9488;
  }
}
</style>
