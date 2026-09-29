import { apiClient } from '../../../services/api/apiClient'
import { tokenStorage } from '../../../services/auth/tokenStorage'
import type { City, CityCreatePayload, Locale } from '../types/city'

function getAuthHeaders(): Record<string, string> {
  const token =
    tokenStorage.getAccessToken() ||
    (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ||
    ''

  const headers: Record<string, string> = {}
  if (token) {
    headers['X-Admin-Password'] = token
  }
  return headers
}

export const citiesApi = {
  /**
   * Fetches all registered cities.
   * Note: The current backend GET /api/admin/cities does not include latitude/longitude in the payload.
   */
  async listCities(): Promise<City[]> {
    return apiClient.get<City[]>('/admin/cities', {
      headers: getAuthHeaders(),
    })
  },

  /**
   * Fetches supported locales from the database.
   */
  async listLocales(): Promise<Locale[]> {
    return apiClient.get<Locale[]>('/admin/locales', {
      headers: getAuthHeaders(),
    })
  },

  /**
   * Creates a new city with translations and optional coordinates.
   * Request schema: CityCreate (names, latitude, longitude).
   */
  async createCity(payload: CityCreatePayload): Promise<City> {
    return apiClient.post<City>('/admin/cities', payload, {
      headers: getAuthHeaders(),
    })
  },

  /**
   * Updates an existing city.
   * Note: Currently the backend PATCH /api/admin/cities/{city_id} validates CityCreate
   * but only updates names; coordinate updates are not persisted by the server yet.
   */
  async updateCity(cityId: number, payload: CityCreatePayload): Promise<City> {
    return apiClient.patch<City>(`/admin/cities/${cityId}`, payload, {
      headers: getAuthHeaders(),
    })
  },
}
