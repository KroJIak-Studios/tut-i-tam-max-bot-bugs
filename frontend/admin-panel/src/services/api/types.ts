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
  refreshExpiresIn?: number
}

export interface AdminUser {
  role: 'admin'
  authenticated: boolean
  username?: string
  expiresIn?: number
}

export interface AdminTokensResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
}

export type AdminLoginResponse = AdminTokensResponse
export type AdminRefreshResponse = AdminTokensResponse

export interface AdminSessionResponse {
  authenticated: boolean
  expires_in: number
}
