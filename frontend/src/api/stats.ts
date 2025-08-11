import { BASE_API_URL } from '@/api/config'
import type { AdminStats } from '@/types/admin'

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${BASE_API_URL}/admin/stats`, {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Échec du chargement des statistiques')
  }

  return await res.json()
}