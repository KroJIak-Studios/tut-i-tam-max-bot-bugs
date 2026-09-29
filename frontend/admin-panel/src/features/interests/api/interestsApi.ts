import { apiClient } from '../../../services/api/apiClient'
import type {
  InterestCreatePayload,
  InterestItem,
  InterestPatchPayload,
  Locale,
} from '../types'

export const interestsApi = {
  async getLocales(): Promise<Locale[]> {
    return apiClient.get<Locale[]>('/admin/locales')
  },

  async getInterests(): Promise<InterestItem[]> {
    return apiClient.get<InterestItem[]>('/admin/interests')
  },

  async createInterest(payload: InterestCreatePayload): Promise<InterestItem> {
    return apiClient.post<InterestItem>('/admin/interests', payload)
  },

  async updateInterest(
    id: number,
    payload: InterestPatchPayload,
  ): Promise<InterestItem> {
    return apiClient.patch<InterestItem>(`/admin/interests/${id}`, payload)
  },

  async deleteInterest(id: number): Promise<void> {
    return apiClient.delete<void>(`/admin/interests/${id}`)
  },
}
