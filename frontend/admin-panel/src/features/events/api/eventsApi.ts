import { apiClient } from '../../../services/api/apiClient'
import { ApiError } from '../../../services/api/types'
import { tokenStorage } from '../../../services/auth/tokenStorage'
import { citiesApi } from '../../cities/api/citiesApi'
import { categoriesApi } from '../../categories/api/categoriesApi'
import { dashboardApi } from '../../dashboard/api/dashboardApi'
import type { City } from '../../cities/types/city'
import type { EventCategory } from '../../categories/types'
import type {
  AdminEventItem,
  AdminEventsListResponse,
  AdminEventWritePayload,
  AdminEventPatchPayload,
  AdminChatCheckResult,
  AdminPhotoUploadResponse,
  EventFiltersState,
  EventsStatsSummary,
} from '../types'

export function formatEventApiError(err: unknown, defaultMessage: string): string {
  if (err instanceof ApiError) {
    if (err.message === 'user_event_has_no_price') {
      return 'Пользовательские события всегда бесплатны: стоимость и Пушкинская карта не могут быть установлены.'
    }
    if (err.message === 'invalid_city') {
      return 'Указан несуществующий или недоступный город.'
    }
    if (err.message === 'invalid_category') {
      return 'Указана несуществующая категория.'
    }
    if (err.message === 'invalid_chat_link') {
      return 'Некорректный формат ссылки на чат MAX. Ожидается ссылка вида max.ru/join/...'
    }
    if (err.message === 'chat_already_used') {
      return 'Эта ссылка уже привязана к другому мероприятию.'
    }
    if (err.message === 'event_photo_limit') {
      return 'Достигнут лимит фотографий: для одного мероприятия разрешено не более 10 фото.'
    }
    if (err.message === 'photo_not_found') {
      return 'Фотография не найдена или уже удалена.'
    }
    if (err.status === 404 || err.message === 'event_not_found') {
      return 'Мероприятие не найдено.'
    }
    if (err.status === 401) {
      return 'Сессия истекла. Пожалуйста, выполните вход повторно.'
    }
    if (err.status === 422) {
      return 'Переданы некорректные параметры данных.'
    }
    if (err.message && !err.message.startsWith('Ошибка сервера') && !err.message.startsWith('Ошибка запроса')) {
      return err.message
    }
  }

  if (err instanceof Error) {
    return err.message
  }

  return defaultMessage
}

export const eventsApi = {
  /**
   * Fetches list of events from the admin backend endpoint:
   * GET /api/admin/events
   * Supports server-side filtering and server pagination (limit, offset).
   */
  async getEvents(
    filters?: Partial<EventFiltersState>,
    pagination?: { limit: number; offset: number },
  ): Promise<AdminEventsListResponse> {
    const params = new URLSearchParams()

    if (filters?.search?.trim()) {
      params.set('q', filters.search.trim())
    }
    if (filters?.cityId && filters.cityId !== 'all') {
      params.set('city_id', String(filters.cityId))
    }
    if (filters?.categoryId && filters.categoryId !== 'all') {
      params.set('category_id', String(filters.categoryId))
    }
    if (filters?.source && filters.source !== 'all') {
      params.set('source', filters.source)
    }
    if (filters?.visible && filters.visible !== 'all') {
      params.set('visible', filters.visible === 'visible' ? 'true' : 'false')
    }
    if (filters?.freeOnly) {
      params.set('free', 'true')
    }
    if (filters?.pushkinOnly) {
      params.set('pushkin', 'true')
    }

    const limit = pagination?.limit ?? 20
    const offset = pagination?.offset ?? 0
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const query = `?${params.toString()}`
    return apiClient.get<AdminEventsListResponse>(`/admin/events${query}`)
  },

  /**
   * Fetches full event card for Admin Panel:
   * GET /api/admin/events/{event_id}
   */
  async getEvent(eventId: number): Promise<AdminEventItem> {
    return apiClient.get<AdminEventItem>(`/admin/events/${eventId}`)
  },

  /**
   * Creates an official event via Admin API:
   * POST /api/admin/events
   */
  async createEvent(payload: AdminEventWritePayload): Promise<AdminEventItem> {
    return apiClient.post<AdminEventItem>('/admin/events', payload)
  },

  /**
   * Updates an existing event:
   * PATCH /api/admin/events/{event_id}
   * DOMAIN RULE: If event is user-created, price_rub and pushkin_card must NOT be sent.
   */
  async updateEvent(
    eventId: number,
    payload: AdminEventPatchPayload,
  ): Promise<AdminEventItem> {
    return apiClient.patch<AdminEventItem>(`/admin/events/${eventId}`, payload)
  },

  /**
   * Deletes an event and its related storage files:
   * DELETE /api/admin/events/{event_id}
   */
  async deleteEvent(eventId: number): Promise<void> {
    return apiClient.delete<void>(`/admin/events/${eventId}`)
  },

  /**
   * Verifies bot rights and connects chat to the event:
   * POST /api/admin/events/{event_id}/chat
   */
  async connectChat(
    eventId: number,
    chatInviteUrl: string,
  ): Promise<AdminChatCheckResult> {
    return apiClient.post<AdminChatCheckResult>(`/admin/events/${eventId}/chat`, {
      chat_invite_url: chatInviteUrl,
    })
  },

  /**
   * Uploads a photo file to media storage and binds to event:
   * POST /api/admin/events/{event_id}/photos
   */
  async uploadPhoto(eventId: number, file: File): Promise<AdminPhotoUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    // Using raw apiRequest with FormData (browser sets multipart/form-data boundary automatically)
    const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
    const token = tokenStorage.getAccessToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${BASE_URL}/admin/events/${eventId}/photos`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      let payload: unknown
      try {
        payload = await response.json()
      } catch {
        payload = null
      }
      const message =
        payload && typeof payload === 'object' && 'detail' in payload && typeof payload.detail === 'string'
          ? payload.detail
          : `Ошибка загрузки фото (${response.status})`
      throw new ApiError(response.status, message, payload)
    }

    return response.json() as Promise<AdminPhotoUploadResponse>
  },

  /**
   * Deletes a specific photo:
   * DELETE /api/admin/events/{event_id}/photos/{photo_id}
   */
  async deletePhoto(eventId: number, photoId: number): Promise<void> {
    return apiClient.delete<void>(`/admin/events/${eventId}/photos/${photoId}`)
  },

  /**
   * Fetches cities list from GET /api/admin/cities to resolve city names and coordinate references.
   */
  async getCities(): Promise<City[]> {
    return citiesApi.listCities()
  },

  /**
   * Fetches categories list from GET /api/admin/event-categories to resolve category names.
   */
  async getCategories(): Promise<EventCategory[]> {
    return categoriesApi.getCategories()
  },

  /**
   * Fetches aggregate stats from GET /api/admin/stats to show verified database event counts.
   */
  async getStats(): Promise<EventsStatsSummary> {
    const stats = await dashboardApi.fetchStats()
    return {
      total: stats.events.total,
      official: stats.events.official,
      userCreated: stats.events.userCreated,
    }
  },
}
