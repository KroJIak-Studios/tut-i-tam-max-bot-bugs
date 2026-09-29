import { apiClient } from '../../../services/api/apiClient'
import type {
  ModerationQueueResponse,
  ModerationQueueFilters,
  ModerationEventCard,
  RejectPayload,
  RequestChangesPayload,
} from '../types'

export const moderationApi = {
  /**
   * GET /api/admin/moderation/events
   * Returns paginated queue with status counts.
   */
  async getQueue(filters: ModerationQueueFilters = {}): Promise<ModerationQueueResponse> {
    const params = new URLSearchParams()

    if (filters.status && filters.status !== 'all') {
      params.set('status', filters.status)
    }
    if (filters.city_id !== undefined) {
      params.set('city_id', String(filters.city_id))
    }
    if (filters.category_id !== undefined) {
      params.set('category_id', String(filters.category_id))
    }
    if (filters.q) {
      params.set('q', filters.q)
    }
    if (filters.limit !== undefined) {
      params.set('limit', String(filters.limit))
    }
    if (filters.offset !== undefined) {
      params.set('offset', String(filters.offset))
    }

    const qs = params.toString()
    return apiClient.get<ModerationQueueResponse>(
      `/admin/moderation/events${qs ? `?${qs}` : ''}`,
    )
  },

  /**
   * GET /api/admin/moderation/events/{event_id}
   * Returns single event card with moderation block.
   */
  async getEvent(eventId: number): Promise<ModerationEventCard> {
    return apiClient.get<ModerationEventCard>(`/admin/moderation/events/${eventId}`)
  },

  /**
   * POST /api/admin/moderation/events/{event_id}/approve
   * Transitions: pending | changes_requested -> approved, visible = true
   */
  async approve(eventId: number): Promise<ModerationEventCard> {
    return apiClient.post<ModerationEventCard>(
      `/admin/moderation/events/${eventId}/approve`,
    )
  },

  /**
   * POST /api/admin/moderation/events/{event_id}/reject
   * Transitions: pending | changes_requested -> rejected, visible = false
   */
  async reject(eventId: number, payload: RejectPayload): Promise<ModerationEventCard> {
    return apiClient.post<ModerationEventCard>(
      `/admin/moderation/events/${eventId}/reject`,
      payload,
    )
  },

  /**
   * POST /api/admin/moderation/events/{event_id}/request-changes
   * Transitions: pending | changes_requested -> changes_requested, visible = false
   */
  async requestChanges(
    eventId: number,
    payload: RequestChangesPayload,
  ): Promise<ModerationEventCard> {
    return apiClient.post<ModerationEventCard>(
      `/admin/moderation/events/${eventId}/request-changes`,
      payload,
    )
  },
}
