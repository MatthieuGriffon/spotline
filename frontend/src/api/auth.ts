import { BASE_API_URL } from '@/api/config'

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${BASE_API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Échec de la connexion')
  }

  return data
}

export async function registerUser(email: string, pseudo: string, password: string) {
  const res = await fetch(`${BASE_API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, pseudo, password })
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Échec de l’inscription')
  }

  return data
}

export async function getMe() {
  const res = await fetch(`${BASE_API_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Utilisateur non authentifié')
  return res.json()
}

export async function logoutUser() {
  const res = await fetch(`${BASE_API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Erreur lors de la déconnexion')
  }

  return res.json()
}