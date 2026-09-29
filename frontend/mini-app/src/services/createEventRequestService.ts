import type { CreateEventDraft, CreateEventRequest } from '../components/CreateEvent/types'
import type { EventCategory } from '../types'
import { apiRequest } from './api'
import { calculateDefaultEndDateTime } from '../utils/formatters'

export const REQUESTS_CHANGED_EVENT = 'tut_i_tam_requests_changed'

export function getStoredRequestsSync(): CreateEventRequest[] { return [] }

export interface SubmitCreateEventResult { success: boolean; data?: CreateEventRequest; error?: string }

interface City { id: string | number; name: string }
interface ApiEvent { id: string | number; title: string; description?: string; category?: EventCategory; address?: string; latitude: number; longitude: number; starts_at: string; ends_at?: string }

function categoryForApi(category: EventCategory): string {
  switch (category) {
    case 'events':
      return 'event'
    case 'places':
      return 'place'
    case 'sports':
      return 'sport'
    case 'parks':
      return 'park'
    case 'volunteer':
      return 'volunteer'
    case 'user':
      return 'event'
    default:
      return 'event'
  }
}

function categoryFromApi(cat?: string): EventCategory {
  switch (cat) {
    case 'event':
      return 'events'
    case 'place':
      return 'places'
    case 'sport':
      return 'sports'
    case 'park':
      return 'parks'
    case 'volunteer':
      return 'volunteer'
    default:
      return 'events'
  }
}

function eventToRequest(event: ApiEvent, locale: 'ru-RU' | 'en-US'): CreateEventRequest {
  const start = new Date(event.starts_at)
  const end = event.ends_at ? new Date(event.ends_at) : undefined
  return {
    id: String(event.id), status: 'approved', source: 'user', isFree: true, pushkinCard: false,
    title: event.title, description: event.description || '', category: categoryFromApi(event.category),
    date: event.starts_at.slice(0, 10), startDate: event.starts_at.slice(0, 10), startTime: start.toTimeString().slice(0, 5),
    endDate: event.ends_at?.slice(0, 10) || event.starts_at.slice(0, 10), endTime: end?.toTimeString().slice(0, 5),
    address: event.address || '', locationMode: 'point', locationPoint: { lat: event.latitude, lng: event.longitude }, createdAt: new Date().toISOString(), locale,
  }
}

export async function getCreateEventRequests(): Promise<CreateEventRequest[]> {
  try {
    const events = await apiRequest<ApiEvent[]>('/me/attendances?when=upcoming')
    return events.map((event) => eventToRequest(event, 'ru-RU'))
  } catch {
    return []
  }
}

export async function getCreateEventRequestById(id: string): Promise<CreateEventRequest | null> {
  try { return eventToRequest(await apiRequest<ApiEvent>(`/events/${id}`), 'ru-RU') } catch { return null }
}

export function clearCreateEventRequests(): void { /* API data cannot be cleared locally. */ }

export async function submitCreateEventRequest(draft: CreateEventDraft, locale: 'ru-RU' | 'en-US' = 'ru-RU'): Promise<SubmitCreateEventResult> {
  try {
    const startDate = draft.startDate || draft.date || ''
    let endDate = draft.endDate || startDate
    let endTime = draft.endTime
    if (!endTime) { const fallback = calculateDefaultEndDateTime(startDate, draft.startTime); endDate = fallback.endDate; endTime = fallback.endTime }
    const cities = await apiRequest<City[]>('/cities')
    const city = cities.find((item) => item.name === 'Казань') || cities[0]
    if (!city) throw new Error('No cities available')
    const point = draft.locationPoint || { lat: 55.796, lng: 49.114 }
    const response = await apiRequest<ApiEvent>('/events', { method: 'POST', body: JSON.stringify({
      title: draft.title.trim(), description: draft.description.trim(), category: categoryForApi(draft.category || 'events'), city_id: city.id,
      address: draft.address.trim(), latitude: point.lat, longitude: point.lng,
      starts_at: new Date(`${startDate}T${draft.startTime}`).toISOString(), ends_at: new Date(`${endDate}T${endTime}`).toISOString(),
      ...(draft.locationArea?.points.length ? { area: draft.locationArea.points.map(({ lat, lng }) => [lat, lng]) } : {}),
    }) })
    const data = eventToRequest(response, locale)
    window.dispatchEvent(new Event(REQUESTS_CHANGED_EVENT))
    return { success: true, data }
  } catch (err) { return { success: false, error: err instanceof Error ? err.message : 'Unknown submission error' } }
}
