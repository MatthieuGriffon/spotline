import { BASE_API_URL } from '@/api/config'
import type { UserDashboardResponseType } from '@/types/dashboard'

// 📋 Récupérer les données du tableau de bord utilisateur
export async function fetchUserDashboard(): Promise<UserDashboardResponseType> {
  console.debug('[DEBUG] Appel API /dashboard')

  const res = await fetch(`${BASE_API_URL}/dashboard`, {
    credentials: 'include'
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erreur lors du chargement du tableau de bord')
  }

  const data: UserDashboardResponseType = await res.json()
  console.debug('[DEBUG] Données dashboard reçues', data)

  return data
}