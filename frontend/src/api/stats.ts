import { BASE_API_URL } from '@/api/config'

export async function fetchAdminStats() {
  const res = await fetch(`${BASE_API_URL}/admin/stats`, {
    credentials: 'include'
  })

  if (!res.ok) {
    throw new Error('Échec du chargement des statistiques')
  }

  return await res.json()
}