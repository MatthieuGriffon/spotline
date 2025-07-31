export interface ModerationLog {
  id: string
  action: 'mask' | 'delete' | 'ignore'
  createdAt: string
  priseId: string
  espece: string
  pseudo: string
  adminPseudo: string
}