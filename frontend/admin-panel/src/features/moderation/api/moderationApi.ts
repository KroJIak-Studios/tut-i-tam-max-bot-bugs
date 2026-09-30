import { apiClient } from '../../../services/api/apiClient'
import { ApiError } from '../../../services/api/types'
import type {
  ModerationQueueResponse,
  ModerationQueueFilters,
  ModerationEventCard,
  RejectPayload,
  RequestChangesPayload,
} from '../types'

function message(error: unknown, fallback: string): never {
  if (error instanceof ApiError && error.message === 'moderation_conflict') {
    throw new Error('Эта заявка уже одобрена или закрыта. Обновите страницу.')
  }
  throw error instanceof Error ? error : new Error(fallback)
}

export const moderationApi = {
  async getQueue(filters: ModerationQueueFilters = {}): Promise<ModerationQueueResponse> {
    const params = new URLSearchParams()
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters.city_id !== undefined) params.set('city_id', String(filters.city_id))
    if (filters.category_id !== undefined) params.set('category_id', String(filters.category_id))
    if (filters.q) params.set('q', filters.q)
    if (filters.limit !== undefined) params.set('limit', String(filters.limit))
    if (filters.offset !== undefined) params.set('offset', String(filters.offset))
    const query = params.toString()
    return apiClient.get<ModerationQueueResponse>(`/admin/moderation/events${query ? `?${query}` : ''}`)
  },

  async getEvent(eventId: number): Promise<ModerationEventCard> {
    return apiClient.get<ModerationEventCard>(`/admin/moderation/events/${eventId}`)
  },

  async approve(eventId: number): Promise<ModerationEventCard> {
    try {
      return await apiClient.post<ModerationEventCard>(`/admin/moderation/events/${eventId}/approve`)
    } catch (error) {
      message(error, 'Не удалось одобрить заявку')
    }
  },

  async reject(eventId: number, payload: RejectPayload): Promise<ModerationEventCard> {
    try {
      return await apiClient.post<ModerationEventCard>(`/admin/moderation/events/${eventId}/reject`, payload)
    } catch (error) {
      message(error, 'Не удалось отклонить заявку')
    }
  },

  async requestChanges(eventId: number, payload: RequestChangesPayload): Promise<ModerationEventCard> {
    try {
      return await apiClient.post<ModerationEventCard>(`/admin/moderation/events/${eventId}/request-changes`, payload)
    } catch (error) {
      message(error, 'Не удалось отправить замечания')
    }
  },
}
