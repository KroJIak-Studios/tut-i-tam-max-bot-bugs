import { apiClient } from '../../../services/api/apiClient'
import type { City, CityCreatePayload, Locale } from '../types/city'

export const citiesApi = {
  /**
   * Fetches all registered cities.
   */
  async listCities(): Promise<City[]> {
    return apiClient.get<City[]>('/admin/cities')
  },

  /**
   * Fetches supported locales from the database.
   */
  async listLocales(): Promise<Locale[]> {
    return apiClient.get<Locale[]>('/admin/locales')
  },

  /**
   * Creates a new city with translations and optional coordinates.
   */
  async createCity(payload: CityCreatePayload): Promise<City> {
    return apiClient.post<City>('/admin/cities', payload)
  },

  /**
   * Updates an existing city.
   */
  async updateCity(cityId: number, payload: CityCreatePayload): Promise<City> {
    return apiClient.patch<City>(`/admin/cities/${cityId}`, payload)
  },

  /**
   * Deletes a city by ID.
   */
  async deleteCity(cityId: number): Promise<void> {
    return apiClient.delete<void>(`/admin/cities/${cityId}`)
  },
}
