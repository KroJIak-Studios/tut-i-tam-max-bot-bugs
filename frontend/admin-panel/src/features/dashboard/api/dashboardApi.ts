import { apiClient } from '../../../services/api/apiClient'
import { ApiError } from '../../../services/api/types'
import { tokenStorage } from '../../../services/auth/tokenStorage'
import type {
  EventsBreakdownData,
  MetricItem,
  TaxonomyData,
  UsersMetricData,
} from '../types'

function getAdminAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const token = tokenStorage.getAccessToken()
  if (token) {
    headers['X-Admin-Password'] = token
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

interface RawCategory {
  id: number
  names?: Array<{ locale_code: string; text: string }>
}

interface RawCity {
  id: number
  names?: Array<{ locale_code: string; text: string }>
}

interface RawInterest {
  id: number
  color?: string
  names?: Array<{ locale_code: string; text: string }>
}

interface RawLocale {
  code: string
  native_name: string
}

interface StatsApiResponse {
  events?: {
    total?: number
    official?: number
    user_created?: number
    userCreated?: number
  }
  users?: {
    total?: number
  }
}

function extractRuName(
  names?: Array<{ locale_code: string; text: string }>,
  fallback: string = '',
): string {
  if (!names || names.length === 0) return fallback
  const ru = names.find((n) => n.locale_code === 'ru-ru')
  if (ru && ru.text) return ru.text
  return names[0].text || fallback
}

export const dashboardApi = {
  async fetchStatsSummary(): Promise<{
    events: MetricItem<EventsBreakdownData>
    users: MetricItem<UsersMetricData>
  }> {
    try {
      const stats = await apiClient.get<StatsApiResponse>('/admin/stats', {
        skipAuth: true,
        headers: getAdminAuthHeaders(),
      })

      const hasEvents =
        stats &&
        typeof stats.events === 'object' &&
        typeof stats.events.total === 'number'

      const hasUsers =
        stats &&
        typeof stats.users === 'object' &&
        typeof stats.users.total === 'number'

      return {
        events: hasEvents
          ? {
              status: 'ready',
              endpoint: 'GET /api/admin/stats',
              data: {
                total: stats.events!.total!,
                official:
                  typeof stats.events!.official === 'number'
                    ? stats.events!.official
                    : 0,
                userCreated:
                  typeof stats.events!.user_created === 'number'
                    ? stats.events!.user_created
                    : typeof stats.events!.userCreated === 'number'
                      ? stats.events!.userCreated
                      : 0,
              },
            }
          : {
              status: 'pending_backend',
              endpoint: 'GET /api/admin/stats',
              notes:
                'Бэкенд не вернул блок events в агрегированной статистике.',
            },
        users: hasUsers
          ? {
              status: 'ready',
              endpoint: 'GET /api/admin/stats',
              data: {
                total: stats.users!.total!,
              },
            }
          : {
              status: 'pending_backend',
              endpoint: 'GET /api/admin/stats',
              notes:
                'Бэкенд не вернул блок users в агрегированной статистике.',
            },
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404 || err.status === 405) {
          return {
            events: {
              status: 'pending_backend',
              endpoint: 'GET /api/admin/stats',
              notes:
                'Эндпоинт GET /api/admin/stats отсутствует на бэкенде (API Gap). Требуется серверная агрегация total, official и user-created мероприятий.',
            },
            users: {
              status: 'pending_backend',
              endpoint: 'GET /api/admin/stats',
              notes:
                'Эндпоинт GET /api/admin/stats отсутствует на бэкенде (API Gap). Таблица пользователей max_users не экспонирует count в API.',
            },
          }
        }
        if (err.status === 401) {
          return {
            events: {
              status: 'unauthorized',
              endpoint: 'GET /api/admin/stats',
              error: 'Требуется авторизация администратора для доступа к статистике.',
            },
            users: {
              status: 'unauthorized',
              endpoint: 'GET /api/admin/stats',
              error: 'Требуется авторизация администратора для доступа к статистике.',
            },
          }
        }
        return {
          events: {
            status: 'error',
            endpoint: 'GET /api/admin/stats',
            error: err.message || 'Ошибка загрузки статистики мероприятий',
          },
          users: {
            status: 'error',
            endpoint: 'GET /api/admin/stats',
            error: err.message || 'Ошибка загрузки статистики пользователей',
          },
        }
      }

      const msg = err instanceof Error ? err.message : 'Сетевая ошибка'
      return {
        events: {
          status: 'error',
          endpoint: 'GET /api/admin/stats',
          error: msg,
        },
        users: {
          status: 'error',
          endpoint: 'GET /api/admin/stats',
          error: msg,
        },
      }
    }
  },

  async fetchCategories(): Promise<MetricItem<TaxonomyData>> {
    try {
      // Публичный рабочий эндпоинт каталога событий
      const list = await apiClient.get<RawCategory[]>('/v1/event-categories', {
        skipAuth: true,
      })

      return {
        status: 'ready',
        endpoint: 'GET /api/v1/event-categories',
        data: {
          count: list.length,
          items: list.map((c) => ({
            id: c.id,
            name: extractRuName(c.names, `Категория #${c.id}`),
          })),
        },
      }
    } catch {
      try {
        const list = await apiClient.get<RawCategory[]>(
          '/admin/event-categories',
          {
            skipAuth: true,
            headers: getAdminAuthHeaders(),
          },
        )
        return {
          status: 'ready',
          endpoint: 'GET /api/admin/event-categories',
          data: {
            count: list.length,
            items: list.map((c) => ({
              id: c.id,
              name: extractRuName(c.names, `Категория #${c.id}`),
            })),
          },
        }
      } catch (adminErr) {
        if (adminErr instanceof ApiError) {
          if (adminErr.status === 401) {
            return {
              status: 'unauthorized',
              endpoint: 'GET /api/admin/event-categories',
              error: 'Требуется пароль администратора',
            }
          }
          return {
            status: 'error',
            endpoint: 'GET /api/admin/event-categories',
            error: adminErr.message,
          }
        }
        return {
          status: 'error',
          endpoint: 'GET /api/admin/event-categories',
          error: 'Не удалось получить категории',
        }
      }
    }
  },

  async fetchCities(): Promise<MetricItem<TaxonomyData>> {
    try {
      const list = await apiClient.get<RawCity[]>('/admin/cities', {
        skipAuth: true,
        headers: getAdminAuthHeaders(),
      })

      return {
        status: 'ready',
        endpoint: 'GET /api/admin/cities',
        data: {
          count: list.length,
          items: list.map((c) => ({
            id: c.id,
            name: extractRuName(c.names, `Город #${c.id}`),
          })),
        },
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          return {
            status: 'unauthorized',
            endpoint: 'GET /api/admin/cities',
            notes: 'Для просмотра справочника городов требуется авторизация (X-Admin-Password).',
          }
        }
        if (err.status === 404) {
          return {
            status: 'pending_backend',
            endpoint: 'GET /api/admin/cities',
            notes: 'Эндпоинт городов недоступен.',
          }
        }
        return {
          status: 'error',
          endpoint: 'GET /api/admin/cities',
          error: err.message,
        }
      }
      return {
        status: 'error',
        endpoint: 'GET /api/admin/cities',
        error: 'Ошибка загрузки городов',
      }
    }
  },

  async fetchInterests(): Promise<MetricItem<TaxonomyData>> {
    try {
      const list = await apiClient.get<RawInterest[]>('/admin/interests', {
        skipAuth: true,
        headers: getAdminAuthHeaders(),
      })

      return {
        status: 'ready',
        endpoint: 'GET /api/admin/interests',
        data: {
          count: list.length,
          items: list.map((i) => ({
            id: i.id,
            name: extractRuName(i.names, `Интерес #${i.id}`),
            subtext: i.color,
          })),
        },
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          return {
            status: 'unauthorized',
            endpoint: 'GET /api/admin/interests',
            notes: 'Для просмотра интересов требуется авторизация (X-Admin-Password).',
          }
        }
        if (err.status === 404) {
          return {
            status: 'pending_backend',
            endpoint: 'GET /api/admin/interests',
            notes: 'Эндпоинт интересов недоступен.',
          }
        }
        return {
          status: 'error',
          endpoint: 'GET /api/admin/interests',
          error: err.message,
        }
      }
      return {
        status: 'error',
        endpoint: 'GET /api/admin/interests',
        error: 'Ошибка загрузки интересов',
      }
    }
  },

  async fetchLocales(): Promise<MetricItem<TaxonomyData>> {
    try {
      const list = await apiClient.get<RawLocale[]>('/admin/locales', {
        skipAuth: true,
        headers: getAdminAuthHeaders(),
      })

      return {
        status: 'ready',
        endpoint: 'GET /api/admin/locales',
        data: {
          count: list.length,
          items: list.map((l) => ({
            id: l.code,
            name: l.native_name || l.code,
            subtext: l.code,
          })),
        },
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          return {
            status: 'unauthorized',
            endpoint: 'GET /api/admin/locales',
            notes: 'Для просмотра локалей требуется авторизация (X-Admin-Password).',
          }
        }
        if (err.status === 404) {
          return {
            status: 'pending_backend',
            endpoint: 'GET /api/admin/locales',
            notes: 'Эндпоинт локалей недоступен.',
          }
        }
        return {
          status: 'error',
          endpoint: 'GET /api/admin/locales',
          error: err.message,
        }
      }
      return {
        status: 'error',
        endpoint: 'GET /api/admin/locales',
        error: 'Ошибка загрузки языковых настроек',
      }
    }
  },
}
