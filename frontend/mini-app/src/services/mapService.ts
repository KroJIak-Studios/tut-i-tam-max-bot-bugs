import type { MapEvent, MapZone, MapFilterState, EventCategory } from '../types'
import { filterEvents, parseTimeToMinutes } from './eventFilters'
import { apiRequest } from './api'

export { parseTimeToMinutes }

export const DEFAULT_INITIAL_ATTENDANCE: Record<string, boolean> = {}
export function loadAttendanceMap(): Record<string, boolean> { return {} }
export function getAttendanceMap(): Record<string, boolean> { return {} }
export function saveAttendanceMap(_map: Record<string, boolean>): void { /* API is the source of truth. */ }

export interface ApiMapEvent {
  id: string | number
  title: string
  description?: string
  latitude: number
  longitude: number
  category_id?: number | null
  date?: string
  starts_at: string
  ends_at?: string
  address?: string
  origin?: 'official' | 'user'
  price_rub?: number | null
  pushkin_card?: boolean | null
  attendees_count?: number
  image?: string
  images?: string[]
  area?: [number, number][]
  going?: boolean
}

export interface EventCategoryRecord { id: number; names: Array<{ locale_code: string; text: string }> }

export function mapApiEvent(item: ApiMapEvent): MapEvent {
  const start = new Date(item.starts_at)
  const end = item.ends_at ? new Date(item.ends_at) : undefined
  const source = item.origin === 'user' ? 'user' : 'external'
  const price = source === 'user' || item.price_rub == null ? 0 : item.price_rub
  return {
    id: String(item.id), title: item.title, description: item.description || '',
    latitude: item.latitude, longitude: item.longitude,
    category: item.category_id == null ? null : String(item.category_id), categoryId: item.category_id ?? null,
    date: item.starts_at.slice(0, 10),
    startDate: item.starts_at.slice(0, 10), endDate: item.ends_at?.slice(0, 10),
    startTime: start.toTimeString().slice(0, 5), endTime: end?.toTimeString().slice(0, 5),
    price, isFree: source === 'user' || price === 0,
    pushkinCard: source === 'user' ? false : Boolean(item.pushkin_card),
    attendeesCount: item.attendees_count ?? 0, source, image: item.image,
    images: item.images, address: item.address, area: item.area, isGoing: item.going,
  }
}

export async function getEventCategories(): Promise<EventCategoryRecord[]> {
  return apiRequest<EventCategoryRecord[]>('/event-categories')
}

export async function getMapZones(cityId: number): Promise<MapZone[]> {
  const items = await apiRequest<Array<{ id: string | number; kind: string; path: [number, number][] }>>(`/map/areas?city_id=${cityId}`)
  return items.map((item) => ({ id: String(item.id), name: '', type: item.kind === 'sport_ground' ? 'sports' : 'park', coordinates: item.path }))
}

export async function getMyAttendances(when: 'upcoming' | 'past'): Promise<MapEvent[]> {
  const items = await apiRequest<ApiMapEvent[]>(`/me/attendances?when=${when}`)
  return items.map((item) => ({ ...mapApiEvent(item), isPast: when === 'past' }))
}

export interface CatalogQuery {
  cityId?: number
  categoryId?: number | null
  source?: 'all' | 'external' | 'user'
  free?: boolean
  pushkin?: boolean
  q?: string
  limit?: number
  offset?: number
  startsAfter?: string
  startsBefore?: string
}

export async function getCatalogEvents(query: CatalogQuery = {}): Promise<MapEvent[]> {
  const params = new URLSearchParams()
  if (query.cityId !== undefined) params.set('city_id', String(query.cityId))
  if (query.categoryId != null) params.set('category_id', String(query.categoryId))
  if (query.source && query.source !== 'all') params.set('source', query.source)
  if (query.free !== undefined) params.set('free', String(query.free))
  if (query.pushkin !== undefined) params.set('pushkin', String(query.pushkin))
  if (query.q) params.set('q', query.q)
  if (query.limit !== undefined) params.set('limit', String(query.limit))
  if (query.offset !== undefined) params.set('offset', String(query.offset))
  if (query.startsAfter) params.set('starts_after', query.startsAfter)
  if (query.startsBefore) params.set('starts_before', query.startsBefore)
  const suffix = params.size ? `?${params.toString()}` : ''
  const items = await apiRequest<ApiMapEvent[]>(`/events${suffix}`)
  return items.map(mapApiEvent)
}

export async function getMapEvents(filters?: Partial<MapFilterState>, cityId?: number): Promise<MapEvent[]> {
  const params = new URLSearchParams()
  if (cityId !== undefined) params.set('city_id', String(cityId))
  const suffix = params.size ? `?${params.toString()}` : ''
  const items = await apiRequest<ApiMapEvent[]>(`/map/events${suffix}`)
  let events = items.map(mapApiEvent)
  if (filters) events = filterEvents(events, filters)
  return events
}

export async function toggleEventAttendance(eventId: string): Promise<MapEvent> {
  const current = await getMapEvents()
  const event = current.find((item) => item.id === eventId)
  if (!event) throw new Error(`Event ${eventId} not found`)
  const going = !event.isGoing
  await apiRequest(`/events/${eventId}/attendance`, { method: going ? 'POST' : 'DELETE' })
  return { ...event, isGoing: going }
}

export async function setEventAttendance(eventId: string, going: boolean): Promise<MapEvent> {
  const current = await getMapEvents()
  const event = current.find((item) => item.id === eventId)
  if (!event) throw new Error(`Event ${eventId} not found`)
  await apiRequest(`/events/${eventId}/attendance`, { method: going ? 'POST' : 'DELETE' })
  return { ...event, isGoing: going }
}

export interface NewUserMarkerInput { title: string; category: EventCategory; startTime: string; latitude: number; longitude: number; description?: string; address?: string }
export async function addUserMarker(input: NewUserMarkerInput): Promise<MapEvent> {
  const events = await getMapEvents()
  const existing = events.find((event) => event.title === input.title)
  if (!existing) throw new Error('User markers are created through the event API')
  return existing
}
