import { BASE_API_URL } from '@/api/config'
import type { ReportedPrise, ModeratePrisePayload } from '@/types/reportedPrise'

// 🔍 Lister toutes les prises signalées
export async function fetchReportedPrises(): Promise<ReportedPrise[]> {
  console.log('[DEBUG] Récupération des prises signalées...')
  const res = await fetch(`${BASE_API_URL}/admin/reported-prises`, {
    credentials: 'include',
  })

  if (!res.ok) throw new Error('Erreur récupération prises signalées')

  const data: ReportedPrise[] = await res.json()

if (data.length > 0) {
  console.log('[DEBUG] Object keys:', Object.keys(data[0]))
  console.log('[DEBUG] reports field exists:', 'reports' in data[0])
  console.log('[DEBUG] reports value:', data[0]['reports'])
}

  console.log('[DEBUG] Réponse brute API prises signalées :', data)
  return data
}

// ✏️ Modérer une prise (masquer, supprimer, ignorer)
export async function moderateReportedPrise(priseId: string, payload: ModeratePrisePayload): Promise<void> {
  console.debug('[DEBUG] Envoi modération', priseId, payload)
  const res = await fetch(`${BASE_API_URL}/admin/reported-prises/${priseId}/moderate`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Erreur lors de la modération de la prise')
  }
}