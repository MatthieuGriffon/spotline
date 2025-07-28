import { BASE_API_URL } from '@/api/config'
import type { User } from '@/types/user'

// 🔄 Lister tous les utilisateurs
export async function fetchAllUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_API_URL}/admin/users`, {
    credentials: 'include'
  })

  if (!res.ok) {
    throw new Error('Échec du chargement des utilisateurs')
  }

  return await res.json()
}

// ❌ Supprimer un utilisateur
export async function deleteUser(id: string): Promise<void> {
  console.log('DELETE vers', `${BASE_API_URL}/user/${id}`)
  const res = await fetch(`${BASE_API_URL}/user/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Erreur lors de la suppression')
  }
}

// ✏️ Mettre à jour un utilisateur
export async function updateUser(id: string, payload: {
  pseudo: string
  role: 'USER' | 'ADMIN'
  isBanned: boolean
}): Promise<User> {
  const res = await fetch(`${BASE_API_URL}/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Erreur lors de la mise à jour')
  }

  return data
}