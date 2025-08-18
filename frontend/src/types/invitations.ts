// ───────── Status divers ─────────
export type InvitationPreviewStatus = 'ok' | 'expired' | 'quota_reached' | 'revoked'
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'REVOKED'

// ───────── Payloads (request) ─────────
export type CreateDirectInvitationBody =
  | { by: 'email'; email: string; joinAuto?: boolean }
  | { by: 'userId'; userId: string; joinAuto?: boolean }

export interface CreateLinkInvitationBody {
  expiresInDays?: number
  maxUses?: number
}

export interface ActOnInviteBody {
  action: 'accept' | 'decline'
}

// ✅ Alias pratique
export type AcceptOrDecline = ActOnInviteBody['action']

// ───────── Responses ─────────

// --- Création d'invitations
export interface CreateDirectInvitationResponse {
  ok: boolean
  invitationId: string
  joinAuto: boolean
}

export interface CreateLinkInvitationResponse {
  token: string
  url: string
  expiresAt: string
  maxUses: number
}

// --- Preview d'une invitation
export interface InvitationPreviewResponse {
  group: { id: string; name: string }
  alreadyMember: boolean
  status: InvitationPreviewStatus
}

// --- Actions sur une invitation par lien
export interface ActOnInviteOk {
  ok: true
  groupId: string
  groupName?: string
  alreadyMember?: boolean
}

export interface ActOnInviteFail {
  ok: false
  alreadyMember?: boolean
}

export type ActOnInviteResponse = ActOnInviteOk | ActOnInviteFail

export interface NeedsAuthResponse {
  needsAuth: boolean
}

export type ActOnInviteResult = ActOnInviteResponse | NeedsAuthResponse

// --- Actions sur une invitation directe (admin → user)
export interface ActDirectInvitationOk {
  ok: true
  groupId: string
  groupName?: string
}

export interface ActDirectInvitationFail {
  ok: false
}

export type ActDirectInvitationResult = ActDirectInvitationOk | ActDirectInvitationFail

// --- Mes invitations (bannière dashboard)
export interface MyInvitesItem {
  id: string
  groupId: string
  groupName: string
  inviterPseudo: string
  status: InvitationStatus | string
  createdAt: string // ISO
}

export interface MyInvitesResponse {
  invitations: MyInvitesItem[]
}

// --- Admin : Invitations d’un groupe
export interface GroupInvitationAdminItem {
  id: string
  type: 'direct' | 'link'
  status: InvitationStatus
  email: string | null
  uses: number
  maxUses: number | null
  expiresAt: string | null // ISO ou null
  createdAt: string // ISO
}

// --- Variantes explicites pour direct
export interface CreateDirectInvitationById {
  inviteeUserId: string
  joinAuto?: boolean
}

export interface CreateDirectInvitationByEmail {
  email: string
  joinAuto?: boolean
}

// ───────── Type guard réutilisable ─────────
export function isNeedsAuth(x: unknown): x is NeedsAuthResponse {
  return typeof x === 'object' && x !== null && 'needsAuth' in x
}
