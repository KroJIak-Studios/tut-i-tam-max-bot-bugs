import type { EventCategory } from '../../types'

export type WizardStepId = 'basics' | 'datetime' | 'location' | 'review'

export interface CreateEventDraft {
  title: string
  description: string
  category: EventCategory | ''
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime?: string
  address: string
  latitude?: number
  longitude?: number
  isFree: true
  pushkinCard: false
  source: 'user'
}

export interface StepConfig {
  id: WizardStepId
  stepNumber: number
  titleKey: string
  helperKey: string
  placeholderKey: string
}
