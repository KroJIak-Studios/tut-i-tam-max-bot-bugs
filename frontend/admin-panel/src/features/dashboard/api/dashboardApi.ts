import { apiClient } from '../../../services/api/apiClient'
import { ApiError } from '../../../services/api/types'
import type { DashboardStats } from '../types'

interface BackendAdminStats {
  events: {
    total: number
    official: number
    user_created: number
  }
  users: {
    total: number
  }
}

interface EventsCountResponse {
  items?: unknown[]
  total?: number
}

/**
 * Fetch event count for a single boolean filter using total from the API.
 * Uses limit=1 to avoid loading full event arrays.
 * Returns null if the endpoint is unavailable (404) or the param is not supported.
 */
async function fetchEventCount(params: Record<string, string>): Promise<number | null> {
  const qs = new URLSearchParams({ limit: '1', ...params }).toString()
  try {
    const data = await apiClient.get<EventsCountResponse | unknown[]>(`/admin/events?${qs}`)
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const typed = data as EventsCountResponse
      if (typeof typed.total === 'number') {
        return typed.total
      }
    }
    // Array shape: endpoint doesn't support total — cannot derive count safely
    return null
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null
    }
    return null
  }
}

export const dashboardApi = {
  async fetchStats(): Promise<DashboardStats> {
    // Primary stats — always available
    const rawPromise = apiClient.get<BackendAdminStats>('/admin/stats')

    // Secondary event counts via filter totals — best-effort, nullable
    const [raw, visible, hidden, free, pushkin] = await Promise.all([
      rawPromise,
      fetchEventCount({ visible: 'true' }),
      fetchEventCount({ visible: 'false' }),
      fetchEventCount({ free: 'true' }),
      fetchEventCount({ pushkin: 'true' }),
    ])

    return {
      events: {
        total: typeof raw?.events?.total === 'number' ? raw.events.total : 0,
        official: typeof raw?.events?.official === 'number' ? raw.events.official : 0,
        userCreated: typeof raw?.events?.user_created === 'number' ? raw.events.user_created : 0,
        visible,
        hidden,
        free,
        pushkin,
      },
      users: {
        total: typeof raw?.users?.total === 'number' ? raw.users.total : 0,
      },
    }
  },
}
