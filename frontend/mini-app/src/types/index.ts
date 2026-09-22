export type NavTabId = 'home' | 'chat' | 'map' | 'plans' | 'profile'

export interface QuickActionItem {
  id: string
  title: string
  subtitle: string
  icon: 'grid' | 'calendar'
  theme: 'purple' | 'orange'
  badge?: string
}

export interface CompactActionItem {
  id: string
  title: string
  subtitle: string
  icon: 'location' | 'heart'
  theme: 'green' | 'pink'
}

export interface EventItem {
  id: string
  title: string
  date: string
  price: string
  imageUrl: string
  tag?: string
}

export type EventCategory =
  | 'events'
  | 'places'
  | 'volunteer'
  | 'sports'
  | 'parks'
  | 'user'

export interface MapEvent {
  id: string
  title: string
  description: string
  latitude: number
  longitude: number
  category: EventCategory
  date: string
  startTime: string // "HH:MM"
  endTime?: string
  price: number // 0 if free
  isFree: boolean
  pushkinCard: boolean
  attendeesCount: number
  isGoing?: boolean
  source: 'external' | 'user'
  image?: string
  address?: string
}

export interface MapZone {
  id: string
  name: string
  type: 'park' | 'sports'
  coordinates: [number, number][]
  description?: string
}

export interface MapFilterState {
  quickChip: 'all' | 'today' | 'free' | 'pushkin' | 'under500' | 'volunteer'
  category: string
  dateFilter: 'all' | 'today' | 'tomorrow' | 'weekend'
  selectedDate: string // "YYYY-MM-DD"
  isFreeOnly: boolean
  maxPrice: number | null
  pushkinCardOnly: boolean
  volunteerOnly: boolean
  minAttendees: number
  source: 'all' | 'external' | 'user'
  timeSlotMinutes: number // minutes from 00:00 (e.g. 19:00 = 1140)
}

export * from './chat'
