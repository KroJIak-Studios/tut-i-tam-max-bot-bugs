import type { AuthTokens } from '../api/types'

const ACCESS_TOKEN_KEY = 'tut_i_tam_admin_access_token'
const REFRESH_TOKEN_KEY = 'tut_i_tam_admin_refresh_token'

let inMemoryAccessToken: string | null = null

export const tokenStorage = {
  getAccessToken(): string | null {
    if (inMemoryAccessToken) {
      return inMemoryAccessToken
    }
    try {
      const stored = sessionStorage.getItem(ACCESS_TOKEN_KEY)
      if (stored) {
        inMemoryAccessToken = stored
        return stored
      }
    } catch {
      // sessionStorage can be restricted in some environments
    }
    return null
  },

  getRefreshToken(): string | null {
    try {
      return sessionStorage.getItem(REFRESH_TOKEN_KEY)
    } catch {
      return null
    }
  },

  setTokens(tokens: AuthTokens): void {
    inMemoryAccessToken = tokens.accessToken
    try {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
      if (tokens.refreshToken) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
      }
    } catch {
      // ignore storage write errors
    }
  },

  clearTokens(): void {
    inMemoryAccessToken = null
    try {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY)
      sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    } catch {
      // ignore storage errors
    }
  },

  hasValidToken(): boolean {
    return Boolean(this.getAccessToken())
  },
}
