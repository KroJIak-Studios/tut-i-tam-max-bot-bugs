/**
 * Domain types and contracts for Admin Panel Events Feature.
 * Aligned with current backend models (Event, OfficialEvent, UserEvent, EventPhoto, EventArea).
 */

export type AdminEventOrigin = 'official' | 'user'

export type AdminEventPhase = 'scheduled' | 'ongoing' | 'finished'

export interface AdminEventAuthor {
  id: number
  first_name: string | null
}

export interface AdminEventReview {
  id: number
  rating: number
  text: string | null
  anonymous: boolean
  author_name: string | null
  is_bot: boolean
  created_at: string
}

export interface AdminEventItem {
  id: number
  title: string
  description: string
  category_id: number | null
  category_name?: string
  city_id: number
  city_name?: string
  address: string
  latitude: number
  longitude: number
  starts_at: string
  ends_at: string | null
  phase: AdminEventPhase
  origin: AdminEventOrigin
  visible?: boolean
  author?: AdminEventAuthor | null
  price_rub: number | null
  pushkin_card: boolean | null
  chat_connected: boolean
  chat_invite_url?: string | null
  area?: number[][] | null
  images: string[]
  going?: boolean
  attendees_count?: number
  reviews?: AdminEventReview[]
}

export interface EventFiltersState {
  search: string
  cityId: number | 'all'
  categoryId: number | 'all'
  origin: 'all' | 'official' | 'user'
  freeOnly: boolean
}

export interface EventPhotoUpdatePayload {
  images: string[]
}

/**
 * Architecture type definition for future Create / Edit forms.
 * Captures all product requirements from lead for subsequent iterations.
 */
export interface AdminEventFormDraft {
  city_id: number | null
  title: string
  description: string
  category_id: number | null
  starts_at: string
  ends_at: string
  address: string
  latitude: number | null
  longitude: number | null
  is_free: boolean
  price_rub: number | null
  pushkin_card: boolean
  area: number[][] | null
  chat_invite_url: string
  images: string[]
}

export interface EventsStatsSummary {
  total: number
  official: number
  userCreated: number
}
