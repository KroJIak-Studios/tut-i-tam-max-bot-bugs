import type { EventCategory } from '../../types'

export type WizardStepId = 'basics' | 'datetime' | 'location' | 'review'

export const USER_EVENT_CATEGORIES: Array<EventCategory> = [
  'events',
  'places',
  'parks',
  'sports',
  'volunteer',
]

export type EventLocationMode = 'point' | 'area'

export interface EventGeoPoint {
  lat: number
  lng: number
}

export interface EventGeoArea {
  points: EventGeoPoint[]
}

export interface CreateEventLocation {
  address: string
  mode: EventLocationMode
  point?: EventGeoPoint
  area?: EventGeoArea
}

export interface CreateEventDraft {
  title: string
  description: string
  category: EventCategory | ''
  date?: string // legacy YYYY-MM-DD
  startDate: string // YYYY-MM-DD
  startTime: string // HH:MM
  endDate: string // YYYY-MM-DD
  endTime: string // HH:MM
  address: string
  locationMode: EventLocationMode
  locationPoint?: EventGeoPoint
  locationArea?: EventGeoArea
  isFree: true
  pushkinCard: false
  source: 'user'
}

export interface StepConfig {
  id: WizardStepId
  stepNumber: number
  titleKey: string
  helperKey: string
}

export interface StepErrors {
  title?: string
  description?: string
  category?: string
  date?: string
  startDate?: string
  startTime?: string
  endDate?: string
  endTime?: string
  range?: string
  address?: string
  locationArea?: string
}

export type CreateEventRequestStatus = 'pending' | 'approved' | 'rejected'

export interface CreateEventRequest {
  id: string
  status: CreateEventRequestStatus
  source: 'user'
  isFree: true
  pushkinCard: false
  title: string
  description: string
  category: EventCategory
  date?: string // legacy
  startDate: string
  startTime: string
  endDate: string
  endTime?: string
  address: string
  locationMode?: EventLocationMode
  locationPoint?: EventGeoPoint
  locationArea?: EventGeoArea
  createdAt: string
  locale: 'ru-RU' | 'en-US'
}
