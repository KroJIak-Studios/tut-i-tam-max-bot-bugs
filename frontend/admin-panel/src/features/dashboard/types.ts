export interface EventsStats {
  total: number
  official: number
  userCreated: number
}

export interface UsersStats {
  total: number
}

export interface DashboardStats {
  events: EventsStats
  users: UsersStats
}

export interface DashboardState {
  data: DashboardStats | null
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  lastUpdated: Date | null
}
