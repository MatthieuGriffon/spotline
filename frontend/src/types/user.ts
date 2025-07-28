export interface User {
  id: string
  pseudo: string
  email: string
  role: 'USER' | 'ADMIN'
  isBanned: boolean
  isConfirmed?: boolean
}

export interface AdminUserUpdatePayload {
  pseudo: string
  role: 'USER' | 'ADMIN'
  isBanned: boolean
}