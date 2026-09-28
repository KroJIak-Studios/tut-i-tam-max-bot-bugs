export type AdminRequestStatus = 'pending' | 'needs_changes' | 'approved' | 'rejected'

export type EventCategory =
  | 'events'
  | 'places'
  | 'parks'
  | 'sports'
  | 'volunteer'
  | 'user'

export type LocationMode = 'point' | 'area'

export interface GeoPoint {
  lat: number
  lng: number
}

export interface GeoArea {
  points: GeoPoint[]
}

export interface AdminAuthor {
  id: string
  name: string
  avatarUrl?: string
}

export interface AdminEventRequest {
  id: string
  author: AdminAuthor
  title: string
  description: string
  category: EventCategory
  startDate: string // "YYYY-MM-DD"
  startTime: string // "HH:MM"
  endDate: string // "YYYY-MM-DD"
  endTime: string // "HH:MM"
  address: string
  locationMode: LocationMode
  locationPoint?: GeoPoint
  locationArea?: GeoArea
  submittedAt: string // ISO Date string
  status: AdminRequestStatus
  moderatorComment?: string
  moderatedAt?: string // ISO Date string
  moderatorName?: string
}

export interface AdminFilterState {
  search: string
  status: AdminRequestStatus | 'all'
  category: EventCategory | 'all'
  locationMode: LocationMode | 'all'
  sort: 'newest' | 'oldest'
}
