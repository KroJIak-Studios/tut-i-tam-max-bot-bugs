import type { CreateEventDraft, CreateEventRequest } from '../components/CreateEvent/types'
import { i18n, FALLBACK_LOCALE } from '../i18n'
import type { EventCategoryRecord } from './eventCategoryService'
import { getEventCategoryName } from './eventCategoryService'
import { getEventCategories } from './mapService'
import { apiRequest, apiUpload } from './api'
import { calculateDefaultEndDateTime } from '../utils/formatters'

export const REQUESTS_CHANGED_EVENT = 'tut_i_tam_requests_changed'
export function getStoredRequestsSync(): CreateEventRequest[] { return [] }
export interface SubmitCreateEventResult { success: boolean; data?: CreateEventRequest; error?: string }

interface City { id: string | number; names: Array<{ locale_code: string; text: string }> }
interface ApiEvent { id: string | number; title: string; description?: string; category_id?: number | null; address?: string; latitude: number; longitude: number; starts_at: string; ends_at?: string }

function eventToRequest(event: ApiEvent, locale: string, categories: EventCategoryRecord[]): CreateEventRequest {
  const start = new Date(event.starts_at)
  const end = event.ends_at ? new Date(event.ends_at) : undefined
  const category = categories.find((item) => item.id === event.category_id)
  return {
    id: String(event.id), status: 'approved', source: 'user', isFree: true, pushkinCard: false,
    title: event.title, description: event.description || '', category: category ? getEventCategoryName(category, locale, FALLBACK_LOCALE) : '',
    date: event.starts_at.slice(0, 10), startDate: event.starts_at.slice(0, 10), startTime: start.toTimeString().slice(0, 5),
    endDate: event.ends_at?.slice(0, 10) || event.starts_at.slice(0, 10), endTime: end?.toTimeString().slice(0, 5),
    address: event.address || '', locationMode: 'point', locationPoint: { lat: event.latitude, lng: event.longitude }, createdAt: new Date().toISOString(), locale,
  }
}

export async function getCreateEventRequests(): Promise<CreateEventRequest[]> {
  try {
    const [events, categories] = await Promise.all([
      apiRequest<ApiEvent[]>('/me/attendances?when=upcoming'), getEventCategories(),
    ])
    return events.map((event) => eventToRequest(event, i18n.language, categories))
  } catch {
    return []
  }
}

export async function getCreateEventRequestById(id: string): Promise<CreateEventRequest | null> {
  try {
    const [event, categories] = await Promise.all([apiRequest<ApiEvent>(`/events/${id}`), getEventCategories()])
    return eventToRequest(event, i18n.language, categories)
  } catch { return null }
}

export function clearCreateEventRequests(): void { /* API data cannot be cleared locally. */ }

export async function submitCreateEventRequest(draft: CreateEventDraft, locale: string = i18n.language): Promise<SubmitCreateEventResult> {
  try {
    const startDate = draft.startDate || draft.date || ''
    let endDate = draft.endDate || startDate
    let endTime = draft.endTime
    if (!endTime) { const fallback = calculateDefaultEndDateTime(startDate, draft.startTime); endDate = fallback.endDate; endTime = fallback.endTime }
    const [cities, categories] = await Promise.all([apiRequest<City[]>('/cities'), getEventCategories()])
    const city = cities.find((item) => item.names.some((name) => name.locale_code === locale && name.text === 'Казань')) || cities[0]
    if (!city) throw new Error('No cities available')
    const categoryId = Number(draft.category)
    if (!Number.isInteger(categoryId) || !categories.some((item) => item.id === categoryId)) throw new Error('Select an event category')
    const point = draft.locationPoint || { lat: 55.796, lng: 49.114 }
    const response = await apiRequest<ApiEvent>('/events', { method: 'POST', body: JSON.stringify({
      title: draft.title.trim(), description: draft.description.trim(), category_id: categoryId, city_id: city.id,
      address: draft.address.trim(), latitude: point.lat, longitude: point.lng,
      starts_at: new Date(`${startDate}T${draft.startTime}`).toISOString(), ends_at: new Date(`${endDate}T${endTime}`).toISOString(),
      ...(draft.locationArea?.points.length ? { area: draft.locationArea.points.map(({ lat, lng }) => [lat, lng]) } : {}),
    }) })
    const data = eventToRequest(response, locale, categories)
    for (const photo of draft.photos) {
      if (!photo.file) continue
      const body = new FormData()
      body.append('file', photo.file)
      await apiUpload(`/events/${response.id}/photos`, body)
    }
    window.dispatchEvent(new Event(REQUESTS_CHANGED_EVENT))
    return { success: true, data }
  } catch (err) {
    const code = err instanceof Error ? err.message : ''
    const error = code === 'moderation_conflict'
      ? 'Фотографии можно менять, пока заявка не одобрена.'
      : code === 'event_photo_limit'
        ? 'Можно добавить не больше 10 фотографий.'
        : code || 'Не удалось отправить заявку'
    return { success: false, error }
  }
}
