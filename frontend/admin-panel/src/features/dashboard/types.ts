export interface EventsStats {
  total: number
  official: number
  userCreated: number
  visible: number | null
  hidden: number | null
  free: number | null
  pushkin: number | null
}

export interface UsersStats {
  total: number
}

export interface DirectoryStats {
  cities: number | null
  categories: number | null
  interests: number | null
}

export interface DashboardStats {
  events: EventsStats
  users: UsersStats
}

export interface DashboardState {
  data: DashboardStats | null
  isLoading: boolean
  error: string | null
}
