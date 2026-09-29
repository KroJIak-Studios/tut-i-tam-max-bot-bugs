import { apiClient } from '../api/apiClient'
import { ApiError } from '../api/types'
import type {
  AdminLoginResponse,
  AdminSessionResponse,
  AdminUser,
  AuthTokens,
} from '../api/types'
import { tokenStorage } from './tokenStorage'

export const authService = {
  async login(password: string): Promise<AdminUser> {
    if (!password.trim()) {
      throw new Error('Введите пароль администратора')
    }

    try {
      const response = await apiClient.post<AdminLoginResponse>(
        '/admin/login',
        { password },
        { skipAuth: true, skipRefresh: true },
      )

      const tokens: AuthTokens = {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresIn: response.expires_in,
        refreshExpiresIn: response.refresh_expires_in,
      }

      tokenStorage.setTokens(tokens)

      return {
        role: 'admin',
        authenticated: true,
        username: 'Администратор',
        expiresIn: response.expires_in,
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          throw new Error('Неверный пароль администратора')
        }
        throw new Error(err.message || 'Ошибка входа в систему')
      }
      throw err instanceof Error ? err : new Error('Неизвестная ошибка авторизации')
    }
  },

  async me(): Promise<AdminSessionResponse> {
    return apiClient.get<AdminSessionResponse>('/admin/me')
  },

  async checkSession(): Promise<AdminUser | null> {
    const accessToken = tokenStorage.getAccessToken()
    const refreshToken = tokenStorage.getRefreshToken()
    if (!accessToken && !refreshToken) {
      return null
    }

    try {
      if (!accessToken && refreshToken) {
        const newAccessToken = await apiClient.refreshToken()
        if (!newAccessToken) {
          return null
        }
      }

      const me = await this.me()
      return {
        role: 'admin',
        authenticated: Boolean(me.authenticated),
        username: 'Администратор',
        expiresIn: me.expires_in,
      }
    } catch {
      tokenStorage.clearTokens()
      return null
    }
  },

  async logout(): Promise<void> {
    tokenStorage.clearTokens()
  },
}
