export type GroupRole = 'admin' | 'member' | 'guest'

// Version “liste” (utilisée dans /groupes)
export interface Group {
  id: string
  name: string
  description?: string
  createdAt: string
  memberCount: number
  role: GroupRole
}

// Membre dans un groupe
export interface GroupMember {
  userId: string
  pseudo: string
  role: GroupRole
}

// Version “détail” (utilisée dans /groupes/:id)
export interface GroupDetails extends Group {
  creatorId: string
  members: GroupMember[]
}

// Payloads API
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