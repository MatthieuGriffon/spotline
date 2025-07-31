import { BASE_API_URL } from '@/api/config'
import type { ModerationLog } from '@/types/moderationLogs'


export async function fetchModerationLogs(): Promise<ModerationLog[]> {
  const res = await fetch(`${BASE_API_URL}/admin/moderation-logs`, {
    credentials: 'include'
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erreur chargement logs de modération')
  }

  return await res.json()
}
