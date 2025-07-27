import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginUser, registerUser, getMe, logoutUser } from '@/api/auth'

export interface User {
  id: string
  email: string
  pseudo: string
  imageUrl?: string
  isConfirmed: boolean
  role: 'user' | 'admin'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  async function login(email: string, password: string) {
    isLoading.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      const data = await loginUser(email, password)
      await fetchMe()
      console.log('[DEBUG] user après login:', user.value)

      successMessage.value = data.message || 'Connexion réussie'
    } catch (err: any) {
      errorMessage.value = err.message ?? 'Erreur lors de la connexion'
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
    } catch (err: any) {
      errorMessage.value = err.message ?? 'Erreur lors de l’inscription'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMe() {
    try {
      const data = await getMe()
      user.value = data
    } catch {
      user.value = null
    }
  }

  async function logout() {
    try {
      await logoutUser()
      user.value = null
      successMessage.value = 'Déconnexion réussie'
    } catch (err: any) {
      errorMessage.value = err.message ?? 'Erreur à la déconnexion'
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
    setUser
  }
})