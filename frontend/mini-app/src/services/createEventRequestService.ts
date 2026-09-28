import type { CreateEventDraft, CreateEventRequest } from '../components/CreateEvent/types'
import type { EventCategory } from '../types'
import { calculateDefaultEndDateTime } from '../utils/formatters'

const STORAGE_KEY = 'tut_i_tam_create_event_requests'
export const REQUESTS_CHANGED_EVENT = 'tut_i_tam_requests_changed'

export function getStoredRequestsSync(): CreateEventRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return (parsed as Array<Record<string, unknown>>)
      .map((item) => {
        const rawDate = typeof item.date === 'string' ? item.date : ''
        const startDate = typeof item.startDate === 'string' && item.startDate ? item.startDate : rawDate
        const startTime = typeof item.startTime === 'string' ? item.startTime : ''

        let endDate = typeof item.endDate === 'string' && item.endDate ? item.endDate : startDate
        let endTime = typeof item.endTime === 'string' ? item.endTime : undefined

        if (!endTime && startTime) {
          const defaultEnd = calculateDefaultEndDateTime(startDate, startTime)
          endTime = defaultEnd.endTime
          if (!item.endDate) {
            endDate = defaultEnd.endDate
          }
        }

        const locationMode = (item.locationMode as 'point' | 'area') || 'point'
        const locationPoint = (item.locationPoint as CreateEventRequest['locationPoint']) || { lat: 55.7960, lng: 49.1140 }
        const locationArea = item.locationArea as CreateEventRequest['locationArea']

        const req: CreateEventRequest = {
          id: (typeof item.id === 'string' ? item.id : '') || `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          status: (item.status as CreateEventRequest['status']) || 'pending',
          source: 'user',
          isFree: true,
          pushkinCard: false,
          title: typeof item.title === 'string' ? item.title : '',
          description: typeof item.description === 'string' ? item.description : '',
          category: (item.category as EventCategory) || 'events',
          date: startDate,
          startDate,
          startTime,
          endDate,
          endTime,
          address: typeof item.address === 'string' ? item.address : '',
          locationMode,
          locationPoint,
          locationArea,
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
          locale: (item.locale as 'ru-RU' | 'en-US') || 'ru-RU',
        }
        return req
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch {
    return []
  }
}

function loadStoredRequests(): CreateEventRequest[] {
  return getStoredRequestsSync()
}

export interface SubmitCreateEventResult {
  success: boolean
  data?: CreateEventRequest
  error?: string
}

/**
 * Service boundary for user-created event requests.
 * Currently uses local mock persistence and simulates network delay.
 * Ready for drop-in replacement with real backend API endpoints.
 */
export async function getCreateEventRequests(): Promise<CreateEventRequest[]> {
  // Small delay to simulate async network boundary
  await new Promise((resolve) => setTimeout(resolve, 60))
  return loadStoredRequests()
}

export async function getCreateEventRequestById(id: string): Promise<CreateEventRequest | null> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  const requests = loadStoredRequests()
  const found = requests.find((r) => r.id === id)
  return found || null
}

export function clearCreateEventRequests(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event(REQUESTS_CHANGED_EVENT))
  } catch {
    // ignore
  }
}

export async function submitCreateEventRequest(
  draft: CreateEventDraft,
  locale: 'ru-RU' | 'en-US' = 'ru-RU',
): Promise<SubmitCreateEventResult> {
  // Simulate network delay for realistic UI feedback
  await new Promise((resolve) => setTimeout(resolve, 500))

  try {
    const category: EventCategory = draft.category || 'events'
    const startDate = draft.startDate || draft.date || ''
    const startTime = draft.startTime
    let endDate = draft.endDate || startDate
    let endTime = draft.endTime

    if (!endTime && startTime) {
      const defaultEnd = calculateDefaultEndDateTime(startDate, startTime)
      endTime = defaultEnd.endTime
      if (!draft.endDate) {
        endDate = defaultEnd.endDate
      }
    }

    const newRequest: CreateEventRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'pending',
      source: 'user',
      isFree: true,
      pushkinCard: false,
      title: draft.title.trim(),
      description: draft.description.trim(),
      category,
      date: startDate,
      startDate,
      startTime,
      endDate,
      endTime,
      address: draft.address.trim(),
      locationMode: draft.locationMode || 'point',
      locationPoint: draft.locationPoint || { lat: 55.7960, lng: 49.1140 },
      locationArea: draft.locationArea,
      createdAt: new Date().toISOString(),
      locale,
    }

    const existing = loadStoredRequests()
    existing.unshift(newRequest)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    window.dispatchEvent(new Event(REQUESTS_CHANGED_EVENT))

    return {
      success: true,
      data: newRequest,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown submission error',
    }
  }
}
