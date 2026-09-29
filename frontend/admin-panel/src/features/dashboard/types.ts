export type MetricAvailability = 'ready' | 'pending_backend' | 'error' | 'unauthorized'

export interface EventsBreakdownData {
  total: number
  official: number
  userCreated: number
}

export interface UsersMetricData {
  total: number
}

export interface TaxonomyItem {
  id: number | string
  name: string
  subtext?: string
}

export interface TaxonomyData {
  count: number
  items: TaxonomyItem[]
}

export interface MetricItem<T> {
  status: MetricAvailability
  data?: T
  error?: string
  notes?: string
  endpoint?: string
}

export interface DashboardState {
  events: MetricItem<EventsBreakdownData>
  users: MetricItem<UsersMetricData>
  categories: MetricItem<TaxonomyData>
  cities: MetricItem<TaxonomyData>
  interests: MetricItem<TaxonomyData>
  locales: MetricItem<TaxonomyData>
  isLoading: boolean
  isRefreshing: boolean
  lastUpdated: Date | null
}
