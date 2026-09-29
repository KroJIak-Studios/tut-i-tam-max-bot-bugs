const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')

type MaxWebApp = {
  initData?: string
  close?: () => void
}

function maxInitData(): string {
  const webApp = (window as Window & { WebApp?: MaxWebApp }).WebApp
  if (webApp?.initData) return webApp.initData

  const isDevAuthEnabled =
    import.meta.env.VITE_ALLOW_DEV_AUTH === 'true' ||
    (import.meta.env.DEV && import.meta.env.VITE_ALLOW_DEV_AUTH !== 'false')
  if (isDevAuthEnabled) {
    return 'dev'
  }
  return ''
}

export class ApiError extends Error {
  status: number
  detail?: string

  constructor(status: number, detail?: string) {
    super(detail || `Request failed with status ${status}`)
    this.status = status
    this.detail = detail
  }
}

export function isAccessCodeRequired(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403 && error.detail === 'access_code_required'
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const initData = maxInitData()
  if (!initData) throw new ApiError(401, 'init_data_required')
  const headers = new Headers(init.headers)
  headers.set('Authorization', `tma ${initData}`)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } catch (err) {
    throw new ApiError(0, err instanceof Error ? err.message : 'network_error')
  }

  if (!response.ok) {
    let detail: string | undefined
    try {
      const body = await response.json() as { detail?: string }
      detail = body.detail
    } catch {
      // Non-JSON error responses are handled by status alone.
    }
    throw new ApiError(response.status, detail)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function closeMaxMiniApp(): void {
  const webApp = (window as Window & { WebApp?: MaxWebApp }).WebApp
  webApp?.close?.()
}

export { API_BASE_URL }