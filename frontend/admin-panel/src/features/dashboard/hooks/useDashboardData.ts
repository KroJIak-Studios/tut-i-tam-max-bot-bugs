import { useCallback, useEffect, useState } from 'react'
import { dashboardApi } from '../api/dashboardApi'
import type { DashboardState } from '../types'

export function useDashboardData() {
  const [state, setState] = useState<DashboardState>({
    data: null,
    isLoading: true,
    error: null,
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
            error: null,
          })
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Не удалось загрузить статистику',
          }))
        }
      })

    return () => {
      isCancelled = true
    }
  }, [refreshIndex])

  const refresh = useCallback(() => {
    setRefreshIndex((prev) => prev + 1)
  }, [])

  return {
    ...state,
    refresh,
  }
}
