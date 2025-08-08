import { BASE_API_URL } from './config'
console.log('appel a user.ts')

export async function getUserMe() {
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`Erreur lors du fetch /auth/me : ${res.statusText}`)
  }

  const data = await res.json()
  console.debug('[DEBUG] Résultat JSON getUserMe:', data)
  return data
}

export async function updatePseudo(pseudo: string) {
  const res = await fetch(`${BASE_API_URL}/user/pseudo`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ pseudo }),
  })
  if (!res.ok) throw new Error('Échec de la mise à jour du pseudo')
  return await res.json()
}

export async function uploadAvatar(formData: FormData): Promise<{ imageUrl: string }> {
  const response = await fetch(`${BASE_API_URL}/user/avatar`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Erreur lors de l’upload de l’avatar')
  }

  return await response.json()
}

export async function requestEmailChange(newEmail: string) {
  const res = await fetch(`${BASE_API_URL}/auth/change-email`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ newEmail }),
  })
  if (!res.ok) throw new Error('Échec de la demande de changement d’email')
  return await res.json()
}

export async function confirmEmail(token: string) {
  const res = await fetch(`${BASE_API_URL}/auth/confirm/${encodeURIComponent(token)}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(msg || 'Confirmation email échouée')
  }
  return res.json()
}
