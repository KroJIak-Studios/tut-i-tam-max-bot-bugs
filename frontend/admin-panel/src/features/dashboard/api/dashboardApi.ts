import { apiClient } from '../../../services/api/apiClient'
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

export const dashboardApi = {
  async fetchStats(): Promise<DashboardStats> {
    const raw = await apiClient.get<BackendAdminStats>('/admin/stats')
    return {
      events: {
        total: typeof raw?.events?.total === 'number' ? raw.events.total : 0,
        official: typeof raw?.events?.official === 'number' ? raw.events.official : 0,
        userCreated: typeof raw?.events?.user_created === 'number' ? raw.events.user_created : 0,
      },
      users: {
        total: typeof raw?.users?.total === 'number' ? raw.users.total : 0,
      },
    }
  },
}
