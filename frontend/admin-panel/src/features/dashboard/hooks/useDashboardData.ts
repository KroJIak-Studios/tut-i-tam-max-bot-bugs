import { useCallback, useEffect, useState } from 'react'
import { dashboardApi } from '../api/dashboardApi'
import type { DashboardState } from '../types'

export function useDashboardData() {
  const [state, setState] = useState<DashboardState>({
    data: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
  })
  const [refreshIndex, setRefreshIndex] = useState<number>(0)

  useEffect(() => {
    let isCancelled = false

    dashboardApi
      .fetchStats()
      .then((data) => {
        if (!isCancelled) {
          setState({
            data,
            isLoading: false,
            isRefreshing: false,
            error: null,
            lastUpdated: new Date(),
          })
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isRefreshing: false,
            error: err instanceof Error ? err.message : 'Не удалось загрузить статистику',
          }))
        }
      })

    return () => {
      isCancelled = true
    }
  }, [refreshIndex])

  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, isRefreshing: true, error: null }))
    setRefreshIndex((prev) => prev + 1)
  }, [])

  return {
    ...state,
    refresh,
  }
}
