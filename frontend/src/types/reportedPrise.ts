export interface ReportedPrise {
  id: string
  priseId: string
  user: {
    id: string
    pseudo: string
  }
  groupName: string | null
  date: string
  photoUrl: string
  description: string | null
  signalementId: string
  reportsCount: number
  reports: string[]
}
export interface ModeratePrisePayload {
  action: 'mask' | 'delete' | 'ignore'
}