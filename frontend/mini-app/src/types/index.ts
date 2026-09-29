export type NavTabId = 'home' | 'chat' | 'map' | 'plans' | 'profile'

export type ActionIcon = 'grid' | 'calendar' | 'location' | 'heart'
export type ActionTheme = 'purple' | 'orange' | 'green' | 'pink'

export interface HomeActionItem {
  id: string
  title: string
  subtitle: string
  icon: ActionIcon
  theme: ActionTheme
  badge?: string
}

export type QuickActionItem = HomeActionItem
export type CompactActionItem = HomeActionItem

export type CatalogSort = 'distance' | 'date' | 'popular' | 'price'

export interface EventItem {
  id: string
  title: string
  date: string
  price: string
  imageUrl: string
  tag?: string
}

export type EventCategory = string

export interface EventReview {
  id: string
  userName: string
  rating: number
  dateText: string
  text: string
  avatarUrl?: string
}

export interface MapEvent {
  id: string
  title: string
  description: string
  latitude: number
  longitude: number
  category: EventCategory | null
  categoryId?: number | null
  categoryName?: string | null
  date: string // "YYYY-MM-DD" (primary or fallback start date)
  startDate?: string // "YYYY-MM-DD"
  endDate?: string // "YYYY-MM-DD"
  startTime: string // "HH:MM"
  endTime?: string // "HH:MM"
  price: number // 0 if free
  isFree: boolean
  pushkinCard: boolean
  attendeesCount: number
  isGoing?: boolean
  source: 'external' | 'user'
  image?: string
  images?: string[]
  address?: string
  reviews?: EventReview[]
  isPast?: boolean
  visitedDate?: string
  aliasIds?: string[]
  area?: [number, number][]
}

export interface MapZone {
  id: string
  name: string
  type: 'park' | 'sports'
  coordinates: [number, number][]
  description?: string
}

export interface MapFilterState {
  quickChip: 'all' | 'free' | 'pushkin'
  category: number | 'all'
  dateFilter: 'all' | 'today' | 'tomorrow' | 'weekend'
  selectedDate: string // "YYYY-MM-DD"
  isFreeOnly: boolean
  pushkinCardOnly: boolean
  minAttendees: number
  source: 'all' | 'external' | 'user'
  timeSlotMinutes?: number | null // minutes from 00:00 (e.g. 19:00 = 1140)
}

export * from './chat'
export * from './profile'
