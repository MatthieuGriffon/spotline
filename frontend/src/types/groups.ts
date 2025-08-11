export type GroupRole = 'admin' | 'member' | 'guest'

// ──────────────── Version “liste” ────────────────
export interface Group {
  id: string
  name: string
  description?: string
  createdAt: string
  memberCount: number
  role: GroupRole
}

// ──────────────── Membre du groupe ────────────────
export interface GroupMemberDetail {
  userId: string
  pseudo: string
  role: GroupRole
  joinedAt: string
}

// ──────────────── SessionSummary ────────────────
export interface SessionSummary {
  id: string
  title: string
  description?: string | null
  date: string
  latitude: number
  longitude: number
  groupId: string
  organizerId: string
  createdAt: string
}

// ──────────────── PriseSummary ────────────────
export interface PriseSummary {
  id: string
  userId: string
  groupId: string
  photoUrl: string
  espece: string
  materiel?: string | null
  date: string
  latitude: number
  longitude: number
  visibility: 'public' | 'private' | 'group'
  createdAt: string
}

// ──────────────── Version “détail” ────────────────
export interface GroupDetails {
  id: string
  name: string
  description?: string
  createdAt: string
  creatorId: string
  members: GroupMemberDetail[]
  sessions: SessionSummary[]
  prises: PriseSummary[]
}

// ──────────────── Payloads API ────────────────
export interface CreateGroupPayload {
  name: string
  description?: string
}

export interface UpdateGroupPayload {
  name: string
  description?: string
}

export interface InviteUserPayload {
  userId: string
  role: GroupRole
}

export interface ChangeMemberRolePayload {
  role: GroupRole
}
