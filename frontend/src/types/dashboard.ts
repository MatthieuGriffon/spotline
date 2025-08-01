export type DashboardGroup = {
  id: string
  name: string
  role: 'admin' | 'member' | 'guest'
  memberCount: number
}

export type DashboardPrise = {
  id: string
  photoUrl: string
  espece: string
  date: string
  groupName?: string
}

export type DashboardSession = {
  id: string
  title: string
  date: string
  role: 'organizer' | 'invited'
  response?: 'yes' | 'no' | 'maybe' | null
  responsesSummary?: {
    yes: number
    no: number
    maybe: number
  }
}

export type UserDashboardResponseType = {
  user: {
    pseudo: string
    imageUrl?: string
    isConfirmed: boolean
  }
  recentGroups: DashboardGroup[]
  recentPrises: DashboardPrise[]
  recentSessions: DashboardSession[]
  stats?: {
    prisesCount: number
    groupsCount: number
    sessionsWaitingReply: number
  }
  spotFavori?: {
    id: string
    name: string
    latitude: number
    longitude: number
  }
  message?: string
}