import type { CreateEventDraft, CreateEventRequest } from '../components/CreateEvent/types'
import type { EventCategory } from '../types'
import { calculateDefaultEndTime } from '../utils/formatters'

const STORAGE_KEY = 'tut_i_tam_create_event_requests'
export const REQUESTS_CHANGED_EVENT = 'tut_i_tam_requests_changed'

export function getStoredRequestsSync(): CreateEventRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return (parsed as CreateEventRequest[])
      .map((item) => ({
        ...item,
        status: item.status || 'pending',
        source: item.source || 'user',
        isFree: true as const,
        pushkinCard: false as const,
        endTime: item.endTime || (item.startTime ? calculateDefaultEndTime(item.startTime) : undefined),
        createdAt: item.createdAt || new Date().toISOString(),
      }))
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

    const newRequest: CreateEventRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'pending',
      source: 'user',
      isFree: true,
      pushkinCard: false,
      title: draft.title.trim(),
      description: draft.description.trim(),
      category,
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime.trim() || calculateDefaultEndTime(draft.startTime),
      address: draft.address.trim(),
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
