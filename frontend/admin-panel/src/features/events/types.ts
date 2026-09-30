/**
 * Domain types and contracts for Admin Panel Events Feature.
 * Strictly aligned with current backend models:
 * - backend/app/schemas/admin_events.py
 * - backend/app/models/event.py
 * - backend/app/services/events_service.py
 *
 * NOTE: No moderation state machine (no pending / approved / rejected).
 * Events strictly use `visible: boolean` and date-based `phase`.
 */

export type AdminEventOrigin = 'official' | 'user'

export type AdminEventPhase = 'scheduled' | 'ongoing' | 'finished'

export interface AdminEventImage {
  id: number
  url: string
  position: number
}

export interface AdminEventAuthor {
  id: number
  first_name: string
  last_name: string | null
}

export interface AdminEventItem {
  id: number
  title: string
  description: string
  city_id: number
  category_id: number | null
  visible: boolean
  address: string
  latitude: number
  longitude: number
  starts_at: string
  ends_at: string | null
  phase: AdminEventPhase
  origin: AdminEventOrigin
  price_rub: number | null
  pushkin_card: boolean | null
  chat_invite_url: string | null
  chat_connected: boolean
  chat_id: number | null
  area: number[][] | null
  images: AdminEventImage[]
  attendees_count: number
  author: AdminEventAuthor | null
}

export interface AdminEventsListResponse {
  total: number
  limit: number
  offset: number
  items: AdminEventItem[]
}

export interface EventFiltersState {
  search: string
  cityId: number | 'all'
  categoryId: number | 'all'
  source: 'all' | 'official' | 'user'
  visible: 'all' | 'visible' | 'hidden'
  freeOnly: boolean
  pushkinOnly: boolean
}

export interface EventPaginationState {
  page: number
  limit: number
  total: number
}

/**
 * Payload for POST /api/admin/events.
 * Creates an official event (admin cannot create user-created events).
 */
export interface AdminEventWritePayload {
  title: string
  description: string
  city_id: number
  category_id?: number | null
  address: string
  latitude: number
  longitude: number
  starts_at: string
  ends_at?: string | null
  price_rub?: number
  pushkin_card?: boolean
  visible?: boolean
  chat_invite_url?: string | null
  area?: number[][] | null
}

/**
 * Payload for PATCH /api/admin/events/{id}.
 * DOMAIN RULE: If event.origin === 'user', price_rub and pushkin_card MUST NOT be included;
 * server will raise 422 user_event_has_no_price.
 */
export interface AdminEventPatchPayload {
  title?: string
  description?: string
  city_id?: number
  category_id?: number | null
  address?: string
  latitude?: number
  longitude?: number
  starts_at?: string
  ends_at?: string | null
  price_rub?: number | null
  pushkin_card?: boolean | null
  visible?: boolean
  chat_invite_url?: string | null
  area?: number[][] | null
}

/**
 * Payload for POST /api/admin/events/{id}/chat
 */
export interface AdminChatCheckPayload {
  chat_invite_url: string
}

export interface AdminChatCheckResult {
  connected: boolean
  missing: string[]
}

/**
 * Response for POST /api/admin/events/{id}/photos
 */
export interface AdminPhotoUploadResponse {
  id: number
  url: string
  position: number
}

export interface EventsStatsSummary {
  total: number
  official: number
  userCreated: number
}
