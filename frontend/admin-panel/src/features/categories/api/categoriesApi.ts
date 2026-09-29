import { apiClient } from '../../../services/api/apiClient'
import { ApiError } from '../../../services/api/types'
import { tokenStorage } from '../../../services/auth/tokenStorage'
import type { EventCategory, EventCategoryInput, LocaleItem } from '../types'

/**
 * Получить заголовки с паролем администратора для бэкенда FastAPI,
 * который требует X-Admin-Password в require_admin dependency.
 */
function getAdminHeaders(): Record<string, string> {
  const token = tokenStorage.getAccessToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers['X-Admin-Password'] = token
  }
  return headers
}

/**
 * Преобразовать техническую ошибку бэкенда в понятный пользователю текст.
 */
export function formatCategoryApiError(err: unknown, defaultMessage: string): string {
  if (err instanceof ApiError) {
    if (err.status === 409 || err.message === 'event_category_in_use') {
      return 'Невозможно удалить категорию: к ней уже привязаны существующие мероприятия.'
    }
    if (err.message === 'duplicate_locale') {
      return 'Один и тот же язык перевода указан дважды.'
    }
    if (err.message === 'invalid_locale') {
      return 'Один из выбранных языков не поддерживается системой.'
    }
    if (err.status === 404 || err.message === 'event_category_not_found') {
      return 'Категория не найдена или уже была удалена.'
    }
    if (err.status === 401 || err.message === 'admin_unauthorized') {
      return 'Ошибка авторизации. Неверный пароль администратора или сессия истекла.'
    }
    if (err.status === 0) {
      return 'Сервер недоступен. Проверьте подключение к сети.'
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

export const categoriesApi = {
  /**
   * Получить список всех категорий мероприятий:
   * GET /api/admin/event-categories
   */
  async getCategories(): Promise<EventCategory[]> {
    return apiClient.get<EventCategory[]>('/admin/event-categories', {
      headers: getAdminHeaders(),
    })
  },

  /**
   * Создать новую категорию мероприятий:
   * POST /api/admin/event-categories
   */
  async createCategory(payload: EventCategoryInput): Promise<EventCategory> {
    return apiClient.post<EventCategory>('/admin/event-categories', payload, {
      headers: getAdminHeaders(),
    })
  },

  /**
   * Обновить существующую категорию мероприятий:
   * PATCH /api/admin/event-categories/{category_id}
   */
  async updateCategory(categoryId: number, payload: EventCategoryInput): Promise<EventCategory> {
    return apiClient.patch<EventCategory>(`/admin/event-categories/${categoryId}`, payload, {
      headers: getAdminHeaders(),
    })
  },

  /**
   * Удалить категорию мероприятий:
   * DELETE /api/admin/event-categories/{category_id}
   */
  async deleteCategory(categoryId: number): Promise<void> {
    return apiClient.delete<void>(`/admin/event-categories/${categoryId}`, {
      headers: getAdminHeaders(),
    })
  },

  /**
   * Получить список поддерживаемых локалей:
   * GET /api/admin/locales
   */
  async getLocales(): Promise<LocaleItem[]> {
    return apiClient.get<LocaleItem[]>('/admin/locales', {
      headers: getAdminHeaders(),
    })
  },
}
