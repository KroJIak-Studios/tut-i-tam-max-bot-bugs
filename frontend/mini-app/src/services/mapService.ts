import type { MapEvent, MapZone, MapFilterState, EventCategory } from '../types'
import { getIsoDate } from '../utils/dateUtils'
import { filterEvents, parseTimeToMinutes } from './eventFilters'
import { apiRequest } from './api'

import { INITIAL_MAP_EVENTS, MAP_ZONES } from '../mocks/mapData'

export { parseTimeToMinutes }

export const DEFAULT_INITIAL_ATTENDANCE: Record<string, boolean> = {}
export function loadAttendanceMap(): Record<string, boolean> { return {} }
export function getAttendanceMap(): Record<string, boolean> { return {} }
export function saveAttendanceMap(_map: Record<string, boolean>): void { /* API is the source of truth. */ }

interface ApiMapEvent {
  id: string | number
  title: string
  description?: string
  latitude: number
  longitude: number
  category?: 'event' | 'place' | 'volunteer' | 'sport' | 'park'
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
}

function mapEvent(item: ApiMapEvent): MapEvent {
  const start = new Date(item.starts_at)
  const end = item.ends_at ? new Date(item.ends_at) : undefined
  const source = item.origin === 'user' ? 'user' : 'external'
  const price = source === 'user' || item.price_rub == null ? 0 : item.price_rub
  return {
    id: String(item.id), title: item.title, description: item.description || '',
    latitude: item.latitude, longitude: item.longitude,
    category: (item.category === 'sport' ? 'sports' : item.category === 'event' ? 'events' : item.category === 'place' ? 'places' : item.category === 'park' ? 'parks' : item.category || 'events') as EventCategory,
    date: item.starts_at.slice(0, 10),
    startDate: item.starts_at.slice(0, 10), endDate: item.ends_at?.slice(0, 10),
    startTime: start.toTimeString().slice(0, 5), endTime: end?.toTimeString().slice(0, 5),
    price, isFree: source === 'user' || price === 0,
    pushkinCard: source === 'user' ? false : Boolean(item.pushkin_card),
    attendeesCount: item.attendees_count ?? 0, source, image: item.image,
    images: item.images, address: item.address, area: item.area,
  }
}

export async function getMapZones(): Promise<MapZone[]> {
  try {
    const items = await apiRequest<Array<{ id: string | number; kind: string; path: [number, number][] }>>('/map/areas?city_id=1')
    if (items && items.length > 0) {
      return items.map((item) => ({ id: String(item.id), name: '', type: item.kind === 'sport_ground' ? 'sports' : 'park', coordinates: item.path }))
    }
  } catch {
    // API not reachable, fallback to mock zones
  }
  return MAP_ZONES
}

export async function getMyAttendances(when: 'upcoming' | 'past'): Promise<MapEvent[]> {
  try {
    const items = await apiRequest<ApiMapEvent[]>(`/me/attendances?when=${when}`)
    return items.map((item) => ({ ...mapEvent(item), isGoing: when === 'upcoming', isPast: when === 'past' }))
  } catch {
    return []
  }
}

export async function getMapEvents(filters?: Partial<MapFilterState>): Promise<MapEvent[]> {
  try {
    const items = await apiRequest<ApiMapEvent[]>('/map/events?min_lat=55.65&min_lng=48.85&max_lat=55.90&max_lng=49.30')
    if (items && items.length > 0) {
      let events = items.map(mapEvent)
      if (filters) events = filterEvents(events, filters)
      return events
    }
  } catch {
    // API not reachable, fallback to initial map events
  }
  return filters ? filterEvents(INITIAL_MAP_EVENTS, filters) : INITIAL_MAP_EVENTS
}

export async function toggleEventAttendance(eventId: string): Promise<MapEvent> {
  const current = await getMapEvents()
  const event = current.find((item) => item.id === eventId)
  if (!event) throw new Error(`Event ${eventId} not found`)
  const going = !event.isGoing
  try {
    await apiRequest(`/events/${eventId}/attendance`, { method: going ? 'POST' : 'DELETE' })
  } catch {
    // offline/fallback: ignore API failure and update state locally
  }
  return { ...event, isGoing: going }
}

export async function setEventAttendance(eventId: string, going: boolean): Promise<MapEvent> {
  const current = await getMapEvents()
  const event = current.find((item) => item.id === eventId)
  if (!event) throw new Error(`Event ${eventId} not found`)
  try {
    await apiRequest(`/events/${eventId}/attendance`, { method: going ? 'POST' : 'DELETE' })
  } catch {
    // offline/fallback: ignore API failure
  }
  return { ...event, isGoing: going }
}

export interface NewUserMarkerInput { title: string; category: EventCategory; startTime: string; latitude: number; longitude: number; description?: string; address?: string }
export async function addUserMarker(input: NewUserMarkerInput): Promise<MapEvent> {
  const events = await getMapEvents()
  return events.find((event) => event.title === input.title) || { ...events[0], ...input, id: `user-${Date.now()}`, source: 'user', price: 0, isFree: true, pushkinCard: false, date: getIsoDate(0), startDate: getIsoDate(0), startTime: input.startTime }
}
