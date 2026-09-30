import type { MapEvent, MapZone, MapFilterState, EventCategory } from '../types'
import { filterEvents, parseTimeToMinutes } from './eventFilters'
import { apiRequest, apiUpload, ApiError } from './api'
import { readProfileBundle } from './profileService'

import { getIsoDate } from '../utils/dateUtils'
import { INITIAL_MAP_EVENTS, MAP_ZONES } from '../mocks/mapData'

export { parseTimeToMinutes }

function shouldFallbackToMocks(err: unknown): boolean {
  if (import.meta.env.VITE_ALLOW_MOCK_FALLBACK !== 'true') return false
  return err instanceof ApiError && err.status === 0
}


export const DEFAULT_INITIAL_ATTENDANCE: Record<string, boolean> = {}
export function loadAttendanceMap(): Record<string, boolean> { return {} }
export function getAttendanceMap(): Record<string, boolean> { return {} }
export function saveAttendanceMap(_map: Record<string, boolean>): void { /* API is the source of truth. */ }

export type EventModerationStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested'

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
  photos?: Array<{ id: number; url: string }>
  going?: boolean
  moderation?: {
    status: EventModerationStatus
    comment?: string | null
    submitted_at?: string | null
  } | null
}

export interface EventCategoryRecord { id: number; code: string | null; names: Array<{ locale_code: string; text: string }> }

export function mapApiEvent(item: ApiMapEvent): MapEvent {
  const start = new Date(item.starts_at)
  const end = item.ends_at ? new Date(item.ends_at) : undefined
  const source = item.origin === 'user' ? 'user' : 'external'
  const price = source === 'user' || item.price_rub == null ? 0 : item.price_rub
  return {
    id: String(item.id), title: item.title, description: item.description || '',
    latitude: item.latitude, longitude: item.longitude,
    category: item.category_id == null ? null : String(item.category_id), categoryId: item.category_id ?? null,
    date: getIsoDate(0, start),
    startDate: getIsoDate(0, start), endDate: end ? getIsoDate(0, end) : undefined,
    startTime: start.toTimeString().slice(0, 5), endTime: end?.toTimeString().slice(0, 5),
    price, isFree: source === 'user' || price === 0,
    pushkinCard: source === 'user' ? false : Boolean(item.pushkin_card),
    attendeesCount: item.attendees_count ?? 0, source, image: item.image || item.images?.[0],
    images: item.images, photos: item.photos?.map((photo) => ({ id: String(photo.id), url: photo.url })), address: item.address, area: item.area, isGoing: item.going,
  }
}

export async function getEventCategories(): Promise<EventCategoryRecord[]> {
  const cached = readProfileBundle()?.eventCategories
  if (cached) return cached
  return apiRequest<EventCategoryRecord[]>('/event-categories')
}

export async function getMapZones(cityId: number): Promise<MapZone[]> {
  try {
    const items = await apiRequest<Array<{ id: string | number; kind: string; path: [number, number][] }>>(`/map/areas?city_id=${cityId}`)
    return items.map((item) => ({ id: String(item.id), name: '', type: item.kind === 'sport_ground' ? 'sports' : 'park', coordinates: item.path }))
  } catch (err) {
    if (shouldFallbackToMocks(err)) {
      console.warn('Backend unavailable and mock fallback enabled, using local zones.')
      return MAP_ZONES
    }
    throw err
  }
}

export async function getMyEventRequests(): Promise<MapEvent[]> {
  const items = await apiRequest<ApiMapEvent[]>('/me/events')
  return items.map((item) => ({
    ...mapApiEvent(item),
    moderationStatus: item.moderation?.status ?? 'pending',
    moderationComment: item.moderation?.comment ?? null,
  }))
}

export interface OwnEventRecord extends MapEvent {
  moderationStatus: NonNullable<MapEvent['moderationStatus']>
  moderationComment: string | null
}

export async function getOwnEvent(eventId: string): Promise<OwnEventRecord> {
  const item = await apiRequest<ApiMapEvent>(`/events/${eventId}`)
  return {
    ...mapApiEvent(item),
    moderationStatus: item.moderation?.status ?? 'pending',
    moderationComment: item.moderation?.comment ?? null,
  }
}

export async function uploadOwnPhoto(eventId: string, file: File): Promise<{ id: number; url: string }> {
  const body = new FormData()
  body.append('file', file)
  return apiUpload<{ id: number; url: string }>(`/events/${eventId}/photos`, body)
}

export async function deleteOwnPhoto(eventId: string, photoId: string): Promise<void> {
  await apiRequest(`/events/${eventId}/photos/${photoId}`, { method: 'DELETE' })
}

export async function orderOwnPhotos(eventId: string, photoIds: string[]): Promise<void> {
  await apiRequest(`/events/${eventId}/photos/order`, { method: 'PUT', body: JSON.stringify({ photo_ids: photoIds.map(Number) }) })
}

export async function updateOwnEvent(eventId: string, body: Record<string, unknown>): Promise<OwnEventRecord> {
  const item = await apiRequest<ApiMapEvent>(`/events/${eventId}`, { method: 'PATCH', body: JSON.stringify(body) })
  return {
    ...mapApiEvent(item),
    moderationStatus: item.moderation?.status ?? 'pending',
    moderationComment: item.moderation?.comment ?? null,
  }
}

export async function getMyAttendances(when: 'upcoming' | 'past'): Promise<MapEvent[]> {
  try {
    const items = await apiRequest<ApiMapEvent[]>(`/me/attendances?when=${when}`)
    return items.map((item) => ({ ...mapApiEvent(item), isPast: when === 'past' }))
  } catch {
    return []
  }
}

export interface CatalogQuery {
  cityId?: number
  categoryId?: number | null
  categoryCode?: string | null
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
  if (query.categoryCode) params.set('category_code', query.categoryCode)
  else if (query.categoryId != null) params.set('category_id', String(query.categoryId))
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
  try {
    const params = new URLSearchParams()
    if (cityId !== undefined) params.set('city_id', String(cityId))
    const suffix = params.size ? `?${params.toString()}` : ''
    const items = await apiRequest<ApiMapEvent[]>(`/map/events${suffix}`)
    let events = items.map(mapApiEvent)
    if (filters) events = filterEvents(events, filters)
    return events
  } catch (err) {
    if (shouldFallbackToMocks(err)) {
      console.warn('Backend unavailable and mock fallback enabled, using local events.')
      return filters ? filterEvents(INITIAL_MAP_EVENTS, filters) : INITIAL_MAP_EVENTS
    }
    throw err
  }
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
