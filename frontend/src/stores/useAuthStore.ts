import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginUser, registerUser, logoutUser } from '@/api/auth'
import { getUserMe } from '@/api/user'

export interface User {
  id: string
  email: string
  pseudo: string
  role: 'USER' | 'ADMIN'
  imageUrl: string | null
  isConfirmed: boolean
  imageUpdatedAt?: string
  updatedAt?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

async function login(email: string, password: string): Promise<void> {
  isLoading.value = true
  errorMessage.value = null
  successMessage.value = null
  try {
    const data = await loginUser(email, password)
    await fetchMe()
    successMessage.value = data.message || 'Connexion réussie'
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Erreur lors de la connexion'
  } finally {
    isLoading.value = false
  }
}
  async function register(email: string, pseudo: string, password: string) {
    isLoading.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      const data = await registerUser(email, pseudo, password)
      successMessage.value = data.message || 'Compte créé ! Vérifie ta boîte mail.'
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : 'Erreur lors de l’inscription'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMe() {
    try {
      const data = await getUserMe()
      console.debug('[DEBUG] Résultat fetchMe:', data)

      // On garde le rôle tel qu'il vient du backend
      user.value = {
        id: data.id,
        email: data.email,
        pseudo: data.pseudo,
        role: data.role as 'USER' | 'ADMIN',
        imageUrl: data.imageUrl ?? null,
        isConfirmed: data.isConfirmed ?? false,
      }
    } catch (err: unknown) {
      console.warn('[WARN] fetchMe error:', err)
      user.value = null
    }
  }

  async function logout() {
    try {
      await logoutUser()
      user.value = null
      successMessage.value = 'Déconnexion réussie'
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : 'Erreur à la déconnexion'
    }
  }

  function setUser(newUser: User | null) {
    user.value = newUser
  }







  return {
    user,
    isLoading,
    errorMessage,
    successMessage,
    login,
    register,
    fetchMe,
    logout,
    setUser,
  }
  
})



