import type { CreateEventDraft, CreateEventRequest } from '../components/CreateEvent/types'
import type { EventCategory } from '../types'

const STORAGE_KEY = 'tut_i_tam_create_event_requests'

function loadStoredRequests(): CreateEventRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export interface SubmitCreateEventResult {
  success: boolean
  data?: CreateEventRequest
  error?: string
}

/**
 * Service boundary for submitting user-created event requests.
 * Currently uses local mock persistence and simulates network delay.
 * Ready for drop-in replacement with real backend API endpoint.
 */
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
      address: draft.address.trim(),
      createdAt: new Date().toISOString(),
      locale,
    }

    const existing = loadStoredRequests()
    existing.unshift(newRequest)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))

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
