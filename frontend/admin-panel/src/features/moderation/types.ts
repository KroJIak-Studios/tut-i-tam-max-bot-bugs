/**
 * Moderation feature types — strictly aligned with backend contracts:
 * - backend/app/api/admin.py (moderation routes)
 * - backend/app/services/events_service.py (admin_card, moderation_queue)
 */

export type ModerationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'changes_requested'

export interface ModerationBlock {
  status: ModerationStatus
  comment: string | null
  submitted_at: string | null
  moderated_at: string | null
  moderated_by: string | null
}

export interface ModerationAuthor {
  id: number
  first_name: string
  last_name: string | null
}

export interface ModerationEventImage {
  id: number
  url: string
  position: number
}

/** Full event card returned by admin_card — includes moderation block */
export interface ModerationEventCard {
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
  phase: 'scheduled' | 'ongoing' | 'finished'
  origin: 'official' | 'user'
  price_rub: number | null
  pushkin_card: boolean | null
  chat_invite_url: string | null
  chat_connected: boolean
  chat_id: number | null
  area: number[][] | null
  images: ModerationEventImage[]
  attendees_count: number
  author: ModerationAuthor | null
  moderation: ModerationBlock | null
}

export interface ModerationCounts {
  pending: number
  approved: number
  rejected: number
  changes_requested: number
}

export interface ModerationQueueResponse {
  total: number
  limit: number
  offset: number
  counts: ModerationCounts
  items: ModerationEventCard[]
}

export interface ModerationQueueFilters {
  status?: ModerationStatus | 'all'
  city_id?: number
  category_id?: number
  q?: string
  limit?: number
  offset?: number
}

export interface RejectPayload {
  reason: string
}

export interface RequestChangesPayload {
  comment: string
}
