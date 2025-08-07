import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginUser, registerUser, getMe, logoutUser } from '@/api/auth'
import { getUserMe } from '@/api/user'

export interface User {
  id: string
  email: string
  pseudo: string
  role: 'USER' | 'ADMIN'
  imageUrl: string | null
  isConfirmed: boolean
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
      console.debug('[DEBUG] user après login:', user.value)

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
      const data = await getUserMe()
      console.debug('[DEBUG] Résultat fetchMe:', data)

      // Sécuriser les champs imageUrl et isConfirmed
      user.value = {
        id: data.id,
        email: data.email,
        pseudo: data.pseudo,
        role: data.role === 'admin' ? 'ADMIN' : 'USER',
        imageUrl: data.imageUrl ?? null,
        isConfirmed: data.isConfirmed ?? false,
      }
    } catch (err) {
      console.warn('[WARN] fetchMe error:', err)
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
    setUser,
  }
})
