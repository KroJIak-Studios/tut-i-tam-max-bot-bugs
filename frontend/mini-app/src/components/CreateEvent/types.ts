import type { EventCategory } from '../../types'

export type WizardStepId = 'basics' | 'datetime' | 'location' | 'review'

export const USER_EVENT_CATEGORIES: Array<EventCategory> = [
  'events',
  'places',
  'parks',
  'sports',
  'volunteer',
]

export interface CreateEventDraft {
  title: string
  description: string
  category: EventCategory | ''
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  address: string
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
  startTime?: string
  address?: string
}

export interface CreateEventRequest {
  id: string
  status: 'pending'
  source: 'user'
  isFree: true
  pushkinCard: false
  title: string
  description: string
  category: EventCategory
  date: string
  startTime: string
  address: string
  createdAt: string
  locale: 'ru-RU' | 'en-US'
}
