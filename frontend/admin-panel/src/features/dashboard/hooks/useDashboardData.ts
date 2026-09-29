import { useCallback, useEffect, useState } from 'react'
import { dashboardApi } from '../api/dashboardApi'
import type { DashboardState } from '../types'

const INITIAL_STATE: DashboardState = {
  events: { status: 'pending_backend' },
  users: { status: 'pending_backend' },
  categories: { status: 'pending_backend' },
  cities: { status: 'pending_backend' },
  interests: { status: 'pending_backend' },
  locales: { status: 'pending_backend' },
  isLoading: true,
  isRefreshing: false,
  lastUpdated: null,
}

type FetchedMetrics = Omit<DashboardState, 'isLoading' | 'isRefreshing' | 'lastUpdated'>

async function fetchAllDashboardMetrics(): Promise<FetchedMetrics> {
  const [statsResult, categoriesResult, citiesResult, interestsResult, localesResult] =
    await Promise.allSettled([
      dashboardApi.fetchStatsSummary(),
      dashboardApi.fetchCategories(),
      dashboardApi.fetchCities(),
      dashboardApi.fetchInterests(),
      dashboardApi.fetchLocales(),
    ])

  return {
    events:
      statsResult.status === 'fulfilled'
        ? statsResult.value.events
        : {
            status: 'error',
            endpoint: 'GET /api/admin/stats',
            error: 'Ошибка получения статистики мероприятий',
          },
    users:
      statsResult.status === 'fulfilled'
        ? statsResult.value.users
        : {
            status: 'error',
            endpoint: 'GET /api/admin/stats',
            error: 'Ошибка получения статистики пользователей',
          },
    categories:
      categoriesResult.status === 'fulfilled'
        ? categoriesResult.value
        : {
            status: 'error',
            endpoint: 'GET /api/v1/event-categories',
            error: 'Ошибка загрузки категорий',
          },
    cities:
      citiesResult.status === 'fulfilled'
        ? citiesResult.value
        : {
            status: 'error',
            endpoint: 'GET /api/admin/cities',
            error: 'Ошибка загрузки городов',
          },
    interests:
      interestsResult.status === 'fulfilled'
        ? interestsResult.value
        : {
            status: 'error',
            endpoint: 'GET /api/admin/interests',
            error: 'Ошибка загрузки интересов',
          },
    locales:
      localesResult.status === 'fulfilled'
        ? localesResult.value
        : {
            status: 'error',
            endpoint: 'GET /api/admin/locales',
            error: 'Ошибка загрузки локалей',
          },
  }
}

export function useDashboardData() {
  const [state, setState] = useState<DashboardState>(INITIAL_STATE)
  const [refreshIndex, setRefreshIndex] = useState<number>(0)

  useEffect(() => {
    let isCancelled = false

    fetchAllDashboardMetrics()
      .then((metrics) => {
        if (!isCancelled) {
          setState((prev) => ({
            ...prev,
            ...metrics,
            isLoading: false,
            isRefreshing: false,
            lastUpdated: new Date(),
          }))
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isRefreshing: false,
          }))
        }
      })

    return () => {
      isCancelled = true
    }
  }, [refreshIndex])

  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, isRefreshing: true }))
    setRefreshIndex((prev) => prev + 1)
  }, [])

  return {
    ...state,
    refresh,
  }
}
