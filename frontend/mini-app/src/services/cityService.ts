import type { CatalogItem } from '../catalogNames'
import { apiRequest } from './api'
import type { GeoPoint } from './geolocationService'

export interface CityRecord extends CatalogItem {
  latitude: number | null
  longitude: number | null
}

export async function getCities(): Promise<CityRecord[]> {
  return apiRequest<CityRecord[]>('/cities')
}

function distanceSquared(city: CityRecord, point: GeoPoint): number {
  if (city.latitude === null || city.longitude === null) return Number.POSITIVE_INFINITY
  const latScale = 111_000
  const lngScale = Math.cos((point.latitude * Math.PI) / 180) * latScale
  const dLat = (city.latitude - point.latitude) * latScale
  const dLng = (city.longitude - point.longitude) * lngScale
  return dLat * dLat + dLng * dLng
}

export function chooseInitialCity(cities: CityRecord[], point: GeoPoint | null): CityRecord | null {
  if (!cities.length) return null
  if (!point) return cities[0]
  return cities.reduce((nearest, city) => distanceSquared(city, point) < distanceSquared(nearest, point) ? city : nearest, cities[0])
}
