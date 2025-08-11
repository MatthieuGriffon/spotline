// src/api/groups.ts
import { BASE_API_URL } from '@/api/config'

// 📋 Récupérer la liste des groupes de l'utilisateur
export async function fetchMyGroups() {
  console.debug('[DEBUG] Appel API /groupes')

  const res = await fetch(`${BASE_API_URL}/groupes`, {
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erreur lors du chargement des groupes')
  }

  const data = await res.json()
  console.debug('[DEBUG] Groupes reçus', data)

  return data
}

// ➕ Créer un nouveau groupe
export async function createGroup(name: string, description?: string) {
  console.debug('[DEBUG] Appel API POST /groupes', { name, description })

  const res = await fetch(`${BASE_API_URL}/groupes`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erreur lors de la création du groupe')
  }

  return res.json()
}

// 🗑 Supprimer un groupe
export async function deleteGroup(groupId: string) {
  console.debug('[DEBUG] Appel API DELETE /groupes/:id', groupId)

  const res = await fetch(`${BASE_API_URL}/groupes/${groupId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erreur lors de la suppression du groupe')
  }

  return res.json()
}
export async function fetchGroupDetails(groupId: string) {
  console.debug('[DEBUG] Appel API GET /groupes/:id', groupId)

  const res = await fetch(`${BASE_API_URL}/groupes/${groupId}`, {
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erreur lors du chargement du groupe')
  }

  return res.json()
}

// ✏️ Mettre à jour un groupe
export async function updateGroup(groupId: string, name: string, description?: string) {
  console.debug('[DEBUG] Appel API PUT /groupes/:id', { groupId, name, description })

  const res = await fetch(`${BASE_API_URL}/groupes/${groupId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erreur lors de la mise à jour du groupe')
  }

  return res.json()
}

// 🚪 Quitter un groupe
export async function leaveGroup(groupId: string) {
  console.debug('[DEBUG] Appel API POST /groupes/:id/leave', groupId)

  const res = await fetch(`${BASE_API_URL}/groupes/${groupId}/leave`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erreur lors du départ du groupe')
  }

  return res.json()
}

// 📩 Inviter un utilisateur
export async function inviteUserToGroup(groupId: string, userId: string, role: string) {
  console.debug('[DEBUG] Appel API POST /groupes/:id/inviter', { groupId, userId, role })

  const res = await fetch(`${BASE_API_URL}/groupes/${groupId}/inviter`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erreur lors de l’invitation')
  }

  return res.json()
}

// 🔄 Changer le rôle d'un membre
export async function changeMemberRole(groupId: string, userId: string, role: string) {
  console.debug('[DEBUG] Appel API PUT /groupes/:id/membres/:userId', { groupId, userId, role })

  const res = await fetch(`${BASE_API_URL}/groupes/${groupId}/membres/${userId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erreur lors du changement de rôle')
  }

  return res.json()
}

// ❌ Retirer un membre
export async function removeMemberFromGroup(groupId: string, userId: string) {
  console.debug('[DEBUG] Appel API DELETE /groupes/:id/membres/:userId', { groupId, userId })

  const res = await fetch(`${BASE_API_URL}/groupes/${groupId}/membres/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erreur lors de la suppression du membre')
  }

  return res.json()
}