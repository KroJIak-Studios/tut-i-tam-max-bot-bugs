import { apiClient } from '../../../services/api/apiClient'
import { tokenStorage } from '../../../services/auth/tokenStorage'
import type {
  InterestCreatePayload,
  InterestItem,
  InterestPatchPayload,
  Locale,
} from '../types'

function getAuthHeaders(): Record<string, string> {
  const token = tokenStorage.getAccessToken()
  return token ? { 'x-admin-password': token } : {}
}

export const interestsApi = {
  async getLocales(): Promise<Locale[]> {
    return apiClient.get<Locale[]>('/admin/locales', {
      headers: getAuthHeaders(),
    })
  },

  async getInterests(): Promise<InterestItem[]> {
    return apiClient.get<InterestItem[]>('/admin/interests', {
      headers: getAuthHeaders(),
    })
  },

  async createInterest(payload: InterestCreatePayload): Promise<InterestItem> {
    return apiClient.post<InterestItem>('/admin/interests', payload, {
      headers: getAuthHeaders(),
    })
  },

  async updateInterest(
    id: number,
    payload: InterestPatchPayload,
  ): Promise<InterestItem> {
    return apiClient.patch<InterestItem>(`/admin/interests/${id}`, payload, {
      headers: getAuthHeaders(),
    })
  },
}
