import { useState, useEffect, useCallback, useMemo } from 'react'
import { eventsApi, formatEventApiError } from '../api/eventsApi'
import type { City } from '../../cities/types/city'
import type { EventCategory } from '../../categories/types'
import type {
  AdminEventItem,
  EventFiltersState,
  EventsStatsSummary,
} from '../types'

const DEFAULT_FILTERS: EventFiltersState = {
  search: '',
  cityId: 'all',
  categoryId: 'all',
  origin: 'all',
  freeOnly: false,
}

export function useEvents() {
  const [events, setEvents] = useState<AdminEventItem[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [stats, setStats] = useState<EventsStatsSummary | null>(null)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isUnavailable, setIsUnavailable] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<EventFiltersState>(DEFAULT_FILTERS)

  const [selectedEvent, setSelectedEvent] = useState<AdminEventItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false)
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState<boolean>(false)
  const [isSavingPhotos, setIsSavingPhotos] = useState<boolean>(false)
  const [photosError, setPhotosError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [citiesRes, categoriesRes, statsRes] = await Promise.allSettled([
        eventsApi.getCities(),
        eventsApi.getCategories(),
        eventsApi.getStats(),
      ])

      if (citiesRes.status === 'fulfilled') {
        setCities(citiesRes.value)
      }
      if (categoriesRes.status === 'fulfilled') {
        setCategories(categoriesRes.value)
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value)
      }

      const eventsResult = await eventsApi.getEvents(filters)
      setIsUnavailable(!eventsResult.isAvailable)
      setEvents(eventsResult.items)
    } catch (err) {
      setError(formatEventApiError(err, 'Не удалось загрузить данные мероприятий'))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    let ignore = false

    Promise.allSettled([
      eventsApi.getCities(),
      eventsApi.getCategories(),
      eventsApi.getStats(),
      eventsApi.getEvents(filters),
    ]).then(([citiesRes, categoriesRes, statsRes, eventsRes]) => {
      if (ignore) return

      if (citiesRes.status === 'fulfilled') {
        setCities(citiesRes.value)
      }
      if (categoriesRes.status === 'fulfilled') {
        setCategories(categoriesRes.value)
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value)
      }

      if (eventsRes.status === 'fulfilled') {
        setIsUnavailable(!eventsRes.value.isAvailable)
        setEvents(eventsRes.value.items)
      } else {
        setError(formatEventApiError(eventsRes.reason, 'Не удалось загрузить данные мероприятий'))
      }

      setIsLoading(false)
    })

    return () => {
      ignore = true
    }
  }, [filters])

  const filteredEvents = useMemo(() => {
    let result = [...events]

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.address.toLowerCase().includes(q),
      )
    }

    if (filters.cityId !== 'all') {
      result = result.filter((e) => e.city_id === filters.cityId)
    }

    if (filters.categoryId !== 'all') {
      result = result.filter((e) => e.category_id === filters.categoryId)
    }

    if (filters.origin !== 'all') {
      result = result.filter((e) => e.origin === filters.origin)
    }

    if (filters.freeOnly) {
      result = result.filter(
        (e) => e.origin === 'user' || e.price_rub === 0 || e.price_rub === null,
      )
    }

    return result
  }, [events, filters])

  const handleUpdateFilters = useCallback((updates: Partial<EventFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const handleOpenDetail = useCallback((event: AdminEventItem) => {
    setSelectedEvent(event)
    setIsDetailOpen(true)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false)
  }, [])

  const handleOpenPhotosModal = useCallback((event: AdminEventItem) => {
    setSelectedEvent(event)
    setPhotosError(null)
    setIsPhotosModalOpen(true)
  }, [])

  const handleClosePhotosModal = useCallback(() => {
    setIsPhotosModalOpen(false)
    setPhotosError(null)
  }, [])

  const handleSavePhotos = useCallback(
    async (eventId: number, images: string[]) => {
      setIsSavingPhotos(true)
      setPhotosError(null)
      try {
        const res = await eventsApi.updateEventPhotos(eventId, images)
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, images: res.images } : e)),
        )
        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent((prev) => (prev ? { ...prev, images: res.images } : null))
        }
        setIsPhotosModalOpen(false)
      } catch (err) {
        setPhotosError(formatEventApiError(err, 'Не удалось сохранить фотографии'))
        throw err
      } finally {
        setIsSavingPhotos(false)
      }
    },
    [selectedEvent],
  )

  return {
    events,
    filteredEvents,
    cities,
    categories,
    stats,
    isLoading,
    isUnavailable,
    error,
    filters,
    selectedEvent,
    isDetailOpen,
    isPhotosModalOpen,
    isSavingPhotos,
    photosError,
    refresh: loadData,
    updateFilters: handleUpdateFilters,
    resetFilters: handleResetFilters,
    openDetail: handleOpenDetail,
    closeDetail: handleCloseDetail,
    openPhotosModal: handleOpenPhotosModal,
    closePhotosModal: handleClosePhotosModal,
    savePhotos: handleSavePhotos,
  }
}
