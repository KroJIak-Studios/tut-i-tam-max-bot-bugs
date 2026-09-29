import { apiClient } from '../api/apiClient'
import { ApiError } from '../api/types'
import type { AdminUser, AuthTokens } from '../api/types'
import { tokenStorage } from './tokenStorage'

interface LoginApiResponse {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  user?: {
    username?: string
    role?: string
  }
}

interface MeApiResponse {
  role?: string
  authenticated?: boolean
  username?: string
}

export const authService = {
  async login(password: string): Promise<AdminUser> {
    if (!password.trim()) {
      throw new Error('Введите пароль администратора')
    }

    try {
      const response = await apiClient.post<LoginApiResponse>(
        '/admin/auth/login',
        { password },
        { skipAuth: true },
      )

      const tokens: AuthTokens = {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        tokenType: response.token_type || 'bearer',
        expiresIn: response.expires_in,
      }

      tokenStorage.setTokens(tokens)

      return {
        role: 'admin',
        authenticated: true,
        username: response.user?.username || 'Администратор',
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          throw new Error(
            'Серверный эндпоинт авторизации (POST /api/admin/auth/login) пока не реализован на бэкенде. См. testing/admin-panel-api-gaps.md',
          )
        }
        if (err.status === 401) {
          throw new Error('Неверный пароль администратора')
        }
        throw new Error(err.message || 'Ошибка входа в систему')
      }
      throw err instanceof Error ? err : new Error('Неизвестная ошибка авторизации')
    }
  },

  async checkSession(): Promise<AdminUser | null> {
    const token = tokenStorage.getAccessToken()
    if (!token) {
      return null
    }

    try {
      const me = await apiClient.get<MeApiResponse>('/admin/auth/me')
      return {
        role: 'admin',
        authenticated: Boolean(me.authenticated ?? true),
        username: me.username || 'Администратор',
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          tokenStorage.clearTokens()
          return null
        }
        if (err.status === 404) {
          // Endpoint /admin/auth/me is missing on backend (API gap)
          // Maintain active session if token exists
          return {
            role: 'admin',
            authenticated: true,
            username: 'Администратор',
          }
        }
      }
      return null
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/admin/auth/logout', undefined, { skipRefresh: true })
    } catch {
      // ignore logout network errors
    } finally {
      tokenStorage.clearTokens()
    }
  },
}
