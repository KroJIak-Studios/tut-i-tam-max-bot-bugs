import { apiRequest } from './api'
import type { CatalogInterest, CatalogItem } from '../catalogNames'

export type ProfileRecord = {
  first_name: string
  last_name?: string | null
  avatar_url: string | null
  locale: string
  city: CatalogItem | null
  interests: CatalogInterest[]
  smart_interest_rotation: boolean
  notifications_enabled: boolean
  notifications_silent: boolean
  notify_event_reminders: boolean
  notify_schedule_changes: boolean
}

export type ProfileBundle = {
  me: ProfileRecord
  cities: CatalogItem[]
  interests: CatalogInterest[]
}

let bundle: ProfileBundle | null = null
let pending: Promise<ProfileBundle> | null = null

export function readProfileBundle(): ProfileBundle | null {
  return bundle
}

export function saveProfile(me: ProfileRecord): void {
  if (bundle) bundle = { ...bundle, me }
}

export function loadProfileBundle(): Promise<ProfileBundle> {
  if (bundle) return Promise.resolve(bundle)
  if (!pending) {
    pending = Promise.all([
      apiRequest<ProfileRecord>('/me'),
      apiRequest<CatalogItem[]>('/cities'),
      apiRequest<CatalogInterest[]>('/interests'),
    ]).then(([me, cities, interests]) => {
      bundle = { me, cities, interests }
      pending = null
      return bundle
    }).catch((error: unknown) => {
      pending = null
      throw error
    })
  }
  return pending
}
