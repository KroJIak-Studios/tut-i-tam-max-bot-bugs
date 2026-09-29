import { ApiError } from './types'
import type { ApiErrorPayload, AuthTokens } from './types'
import { tokenStorage } from '../auth/tokenStorage'

export const ADMIN_UNAUTHORIZED_EVENT = 'tut_i_tam_admin_unauthorized'

const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
  skipRefresh?: boolean
}

let isRefreshing = false
let refreshSubscribers: Array<(token: string | null) => void> = []

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

function addRefreshSubscriber(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb)
}

function formatErrorMessage(status: number, payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return `Ошибка сервера (${status})`
  }

  const err = payload as ApiErrorPayload
  if (typeof err.detail === 'string') {
    return err.detail
  }

  if (Array.isArray(err.detail) && err.detail.length > 0) {
    const first = err.detail[0]
    if (first && typeof first === 'object' && 'msg' in first && typeof first.msg === 'string') {
      return first.msg
    }
  }

  if (typeof err.message === 'string') {
    return err.message
  }

  return `Ошибка запроса (${status})`
}

async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) {
    return null
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      tokenStorage.clearTokens()
      return null
    }

    const data = (await response.json()) as {
      access_token: string
      refresh_token?: string
      expires_in?: number
      refresh_expires_in?: number
    }

    const tokens: AuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
      refreshExpiresIn: data.refresh_expires_in,
    }
    tokenStorage.setTokens(tokens)
    return tokens.accessToken
  } catch {
    tokenStorage.clearTokens()
    return null
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  const headers = new Headers(options.headers || {})

  if (!options.skipAuth) {
    const token = tokenStorage.getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch (error) {
    throw new ApiError(0, 'Ошибка сети: сервер недоступен', error)
  }

  if (response.status === 401 && !options.skipAuth) {
    if (!options.skipRefresh) {
      const refreshToken = tokenStorage.getRefreshToken()
      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true
          const newToken = await tryRefreshToken()
          isRefreshing = false
          onRefreshed(newToken)

          if (newToken) {
            return apiRequest<T>(endpoint, {
              ...options,
              skipRefresh: true,
            })
          }
        } else {
          return new Promise<T>((resolve, reject) => {
            addRefreshSubscriber((newToken) => {
              if (newToken) {
                resolve(
                  apiRequest<T>(endpoint, {
                    ...options,
                    skipRefresh: true,
                  }),
                )
              } else {
                reject(new ApiError(401, 'Сессия истекла'))
              }
            })
          })
        }
      }
    }

    tokenStorage.clearTokens()
    window.dispatchEvent(new CustomEvent(ADMIN_UNAUTHORIZED_EVENT))
    throw new ApiError(401, 'Необходима авторизация')
  }

  if (!response.ok) {
    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      payload = null
    }
    const message = formatErrorMessage(response.status, payload)
    throw new ApiError(response.status, message, payload)
  }

  if (response.status === 204) {
    return undefined as unknown as T
  }

  return response.json() as Promise<T>
}

export const apiClient = {
  refreshToken: tryRefreshToken,
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
}
