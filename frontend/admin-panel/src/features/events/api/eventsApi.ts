import { apiClient } from '../../../services/api/apiClient'
import { ApiError } from '../../../services/api/types'
import { citiesApi } from '../../cities/api/citiesApi'
import { categoriesApi } from '../../categories/api/categoriesApi'
import { dashboardApi } from '../../dashboard/api/dashboardApi'
import type { City } from '../../cities/types/city'
import type { EventCategory } from '../../categories/types'
import type {
  AdminEventItem,
  EventFiltersState,
  EventPhotoUpdatePayload,
  EventsStatsSummary,
} from '../types'

export interface EventsFetchResult {
  items: AdminEventItem[]
  total: number
  isAvailable: boolean
}

export function formatEventApiError(err: unknown, defaultMessage: string): string {
  if (err instanceof ApiError) {
    if (err.status === 404) {
      return 'Запрошенный ресурс не найден.'
    }
    if (err.status === 401) {
      return 'Сессия истекла. Пожалуйста, выполните вход повторно.'
    }
    if (err.status === 422) {
      return 'Переданы некорректные параметры данных.'
    }
    if (err.message === 'event_photo url is invalid') {
      return 'Некорректная ссылка на фотографию. Ссылка должна быть непустой и не длиннее 2048 символов.'
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
   *
   * If the endpoint has not yet been deployed on the backend (404),
   * returns a graceful isAvailable: false result without throwing an uncaught error.
   */
  async getEvents(filters?: Partial<EventFiltersState>): Promise<EventsFetchResult> {
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
    if (filters?.origin && filters.origin !== 'all') {
      params.set('source', filters.origin)
    }
    if (filters?.freeOnly) {
      params.set('free', 'true')
    }

    const query = params.toString() ? `?${params.toString()}` : ''

    try {
      const data = await apiClient.get<
        AdminEventItem[] | { items: AdminEventItem[]; total?: number }
      >(`/admin/events${query}`)

      if (Array.isArray(data)) {
        return {
          items: data,
          total: data.length,
          isAvailable: true,
        }
      }

      if (data && typeof data === 'object' && Array.isArray(data.items)) {
        return {
          items: data.items,
          total: typeof data.total === 'number' ? data.total : data.items.length,
          isAvailable: true,
        }
      }

      return {
        items: [],
        total: 0,
        isAvailable: true,
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        // Backend admin event catalog endpoint is not yet mounted on current backend build
        return {
          items: [],
          total: 0,
          isAvailable: false,
        }
      }
      throw error
    }
  },

  /**
   * Updates photos for a specific event via real backend endpoint:
   * PATCH /api/admin/events/{event_id}/photos
   * Max 3 image URLs allowed by backend schema.
   */
  async updateEventPhotos(
    eventId: number,
    images: string[],
  ): Promise<{ id: number; images: string[] }> {
    const payload: EventPhotoUpdatePayload = {
      images: images.slice(0, 3),
    }
    return apiClient.patch<{ id: number; images: string[] }>(
      `/admin/events/${eventId}/photos`,
      payload,
    )
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
