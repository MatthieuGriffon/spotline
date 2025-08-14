// src/api/invitations.ts
import { BASE_API_URL } from '@/api/config'
import type {
  CreateDirectInvitationBody,
  CreateDirectInvitationResponse,
  CreateLinkInvitationBody,
  CreateLinkInvitationResponse,
  InvitationPreviewResponse,
  ActOnInviteBody,
  ActOnInviteResult,
  NeedsAuthResponse,
  MyInvitesResponse,
  GroupInvitationAdminItem,
} from '@/types/invitations'

// Utils d’erreur homogènes
async function parseError(res: Response) {
  try {
    return await res.json()
  } catch {
    return { message: res.statusText }
  }
}

/* =========================
 * A) Invitation directe (admin/owner)
 * ========================= */
export async function createDirectInvitation(
  groupId: string,
  body: CreateDirectInvitationBody,
): Promise<CreateDirectInvitationResponse> {
  console.debug('[DEBUG] POST /groupes/:groupId/invitations', { groupId, body })

  const res = await fetch(`${BASE_API_URL}/groupes/${groupId}/invitations`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await parseError(res)
    throw new Error(error.message || 'Erreur lors de la création de l’invitation')
  }

  return res.json()
}

/* =========================
 * B) Créer un lien/QR (admin/owner)
 * ========================= */
export async function createLinkInvitation(
  groupId: string,
  body: CreateLinkInvitationBody,
): Promise<CreateLinkInvitationResponse> {
  console.debug('[DEBUG] POST /groupes/:groupId/invitations/link', { groupId, body })

  const res = await fetch(`${BASE_API_URL}/groupes/${groupId}/invitations/link`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await parseError(res)
    throw new Error(error.message || 'Erreur lors de la création du lien d’invitation')
  }

  return res.json()
}

/* =========================
 * B/C) Preview d’un lien/QR (public)
 * ========================= */
export async function previewInvitation(token: string): Promise<InvitationPreviewResponse> {
  console.debug('[DEBUG] GET /invite/preview/:token', token)

  const res = await fetch(`${BASE_API_URL}/invite/preview/${encodeURIComponent(token)}`, {
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await parseError(res)
    throw new Error(error.message || 'Erreur lors de la prévisualisation de l’invitation')
  }

  return res.json()
}

/* =========================
 * B/C) Accepter/Refuser un lien (public → 401 {needsAuth:true} si non connecté)
 * ========================= */
export async function actOnInvite(
  token: string,
  body: ActOnInviteBody,
): Promise<ActOnInviteResult> {
  console.debug('[DEBUG] POST /invite/:token', { token, body })

  const res = await fetch(`${BASE_API_URL}/invite/${encodeURIComponent(token)}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await res.json() : null

  if (!res.ok) {
    if (res.status === 401 && payload?.needsAuth) {
      return payload as NeedsAuthResponse
    }
    const message = payload?.message || res.statusText
    throw new Error(message || 'Erreur lors de l’action sur l’invitation')
  }

  return payload as ActOnInviteResult
}

/* =========================
 * A) Mes invitations directes (bannière)
 * ========================= */
export async function listMyInvitations(): Promise<MyInvitesResponse> {
  console.debug('[DEBUG] GET /groupes/me/invitations')

  const res = await fetch(`${BASE_API_URL}/groupes/me/invitations`, {
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await parseError(res)
    throw new Error(error.message || 'Erreur lors du chargement de mes invitations')
  }

  return res.json()
}

/* =========================
 * Admin — Lister les invitations d’un groupe
 * ========================= */
export async function listGroupInvitations(
  groupId: string,
): Promise<{ invitations: GroupInvitationAdminItem[] }> {
  console.debug('[DEBUG] GET /groupes/:groupId/invitations/admin', { groupId })

  const res = await fetch(`${BASE_API_URL}/groupes/${groupId}/invitations/admin`, {
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await parseError(res)
    throw new Error(error.message || 'Erreur lors du chargement des invitations du groupe')
  }

  return res.json()
}

/* =========================
 * Admin — Révoquer une invitation
 * ========================= */
export async function revokeInvitation(
  groupId: string,
  invitationId: string,
): Promise<{ ok: boolean }> {
  console.debug('[DEBUG] POST /groupes/:groupId/invitations/:invitationId/revoke', {
    groupId,
    invitationId,
  })

  const res = await fetch(`${BASE_API_URL}/groupes/${groupId}/invitations/${invitationId}/revoke`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await parseError(res)
    throw new Error(error.message || 'Erreur lors de la révocation de l’invitation')
  }

  return res.json()
}

/* =========================
 * NEW: Accepter/Refuser une invitation directe (par id)
 * ========================= */
export async function actDirectInvitation(
  invitationId: string,
  action: 'accept' | 'decline',
): Promise<{ ok: boolean }> {
  console.debug('[DEBUG] POST /groupes/me/invitations/:id/act', { invitationId, action })

  const res = await fetch(
    `${BASE_API_URL}/groupes/me/invitations/${encodeURIComponent(invitationId)}/act`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    },
  )

  if (!res.ok) {
    const error = await parseError(res)
    throw new Error(error.message || 'Erreur lors de l’action sur l’invitation')
  }

  return res.json()
}
