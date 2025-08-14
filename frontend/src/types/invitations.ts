export type InvitationPreviewStatus = 'ok' | 'expired' | 'quota_reached' | 'revoked'

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

// ✅ Nouveau alias pour éviter de répéter :
export type AcceptOrDecline = ActOnInviteBody['action']

// ───────── Responses ─────────
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
export interface InvitationPreviewResponse {
  group: { id: string; name: string }
  alreadyMember: boolean
  status: InvitationPreviewStatus
}
export interface ActOnInviteResponse {
  ok: boolean
  alreadyMember?: boolean
}
export interface NeedsAuthResponse {
  needsAuth: boolean
}
export type ActOnInviteResult = ActOnInviteResponse | NeedsAuthResponse

export interface MyInvitesItem {
  id: string
  groupId: string
  groupName: string
  inviterPseudo: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'REVOKED' | string
  createdAt: string
}
export interface MyInvitesResponse {
  invitations: MyInvitesItem[]
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'REVOKED'

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
