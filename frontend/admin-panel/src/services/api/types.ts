export interface ApiErrorPayload {
  detail?: string | Array<{ msg?: string; loc?: Array<string | number> }>
  message?: string
}

export class ApiError extends Error {
  public status: number
  public detail?: unknown

  constructor(status: number, message: string, detail?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  tokenType?: string
  expiresIn?: number
}

export interface AdminUser {
  role: 'admin'
  authenticated: boolean
  username?: string
}
