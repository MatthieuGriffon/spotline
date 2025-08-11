import { BASE_API_URL } from '@/api/config'

export async function changePassword(oldPassword: string, newPassword: string) {
  const res = await fetch(`${BASE_API_URL}/auth/password`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPassword, newPassword }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Échec du changement de mot de passe')
  return data
}

export async function requestForgotPassword(email: string) {
  const res = await fetch(`${BASE_API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Échec de la demande de réinitialisation')
  return data
}

export async function resetPassword(token: string, newPassword: string) {
  const res = await fetch(`${BASE_API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Échec de la réinitialisation')
  return data
}

// Optionnel si tu utilises la confirmation par email pour le changement
export async function confirmPasswordChange(token: string) {
  const res = await fetch(`${BASE_API_URL}/auth/confirm-password-change`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Confirmation invalide')
  return data
}
