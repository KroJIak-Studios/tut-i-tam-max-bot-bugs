import { useState, useEffect, useCallback, useRef } from 'react'
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
  source: 'all',
  visible: 'all',
  freeOnly: false,
  pushkinOnly: false,
}

const PAGE_SIZE = 20

export function useEvents() {
  const [events, setEvents] = useState<AdminEventItem[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [stats, setStats] = useState<EventsStatsSummary | null>(null)

  // Server pagination
  const [page, setPage] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)
  const limit = PAGE_SIZE

  // Loading & error states
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filters with debounced search
  const [filters, setFilters] = useState<EventFiltersState>(DEFAULT_FILTERS)
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Detail modal state with server-side fresh fetch
  const [selectedEvent, setSelectedEvent] = useState<AdminEventItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false)

  // Photos modal state
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState<boolean>(false)
  const [isMutatingPhoto, setIsMutatingPhoto] = useState<boolean>(false)
  const [photosError, setPhotosError] = useState<string | null>(null)

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(filters.search.trim())
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [filters.search])

  // Reset page to 1 when filters change
  const handleUpdateFilters = useCallback((updates: Partial<EventFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
    setPage(1)
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }, [])

  // Main data loader from backend
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const offset = (page - 1) * limit
    const activeFilters = {
      ...filters,
      search: debouncedSearch,
    }

    try {
      const [citiesRes, categoriesRes, statsRes, eventsRes] = await Promise.allSettled([
        eventsApi.getCities(),
        eventsApi.getCategories(),
        eventsApi.getStats(),
        eventsApi.getEvents(activeFilters, { limit, offset }),
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

      if (eventsRes.status === 'fulfilled') {
        setEvents(eventsRes.value.items)
        setTotal(eventsRes.value.total)
      } else {
        setError(formatEventApiError(eventsRes.reason, 'Не удалось загрузить мероприятия'))
      }
    } catch (err) {
      setError(formatEventApiError(err, 'Не удалось загрузить данные мероприятий'))
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, filters, debouncedSearch])

  useEffect(() => {
    let ignore = false

    const offset = (page - 1) * limit
    const activeFilters = {
      ...filters,
      search: debouncedSearch,
    }

    Promise.allSettled([
      eventsApi.getCities(),
      eventsApi.getCategories(),
      eventsApi.getStats(),
      eventsApi.getEvents(activeFilters, { limit, offset }),
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
        setEvents(eventsRes.value.items)
        setTotal(eventsRes.value.total)
      } else {
        setError(formatEventApiError(eventsRes.reason, 'Не удалось загрузить мероприятия'))
      }

      setIsLoading(false)
    })

    return () => {
      ignore = true
    }
  }, [page, limit, filters, debouncedSearch])

  // Open detail with lightweight state immediately, then fetch fresh detail from server
  const handleOpenDetail = useCallback(async (event: AdminEventItem) => {
    setSelectedEvent(event)
    setIsDetailOpen(true)
    setIsLoadingDetail(true)

    try {
      const freshDetail = await eventsApi.getEvent(event.id)
      setSelectedEvent(freshDetail)
    } catch {
      // Keep lightweight state if server fetch fails
    } finally {
      setIsLoadingDetail(false)
    }
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

  // Photo actions
  const handleUploadPhoto = useCallback(
    async (eventId: number, file: File) => {
      setIsMutatingPhoto(true)
      setPhotosError(null)
      try {
        const uploaded = await eventsApi.uploadPhoto(eventId, file)
        const updatedImages = [...(selectedEvent?.images || []), uploaded]
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, images: updatedImages } : e)),
        )
        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent((prev) => (prev ? { ...prev, images: updatedImages } : null))
        }
      } catch (err) {
        setPhotosError(formatEventApiError(err, 'Не удалось загрузить фотографию'))
        throw err
      } finally {
        setIsMutatingPhoto(false)
      }
    },
    [selectedEvent],
  )

  const handleDeletePhoto = useCallback(
    async (eventId: number, photoId: number) => {
      setIsMutatingPhoto(true)
      setPhotosError(null)
      try {
        await eventsApi.deletePhoto(eventId, photoId)
        const updatedImages = (selectedEvent?.images || []).filter((p) => p.id !== photoId)
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, images: updatedImages } : e)),
        )
        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent((prev) => (prev ? { ...prev, images: updatedImages } : null))
        }
      } catch (err) {
        setPhotosError(formatEventApiError(err, 'Не удалось удалить фотографию'))
        throw err
      } finally {
        setIsMutatingPhoto(false)
      }
    },
    [selectedEvent],
  )

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return {
    events,
    cities,
    categories,
    stats,
    isLoading,
    error,
    filters,
    page,
    limit,
    total,
    totalPages,
    selectedEvent,
    isDetailOpen,
    isLoadingDetail,
    isPhotosModalOpen,
    isMutatingPhoto,
    photosError,
    setPage,
    refresh: loadData,
    updateFilters: handleUpdateFilters,
    resetFilters: handleResetFilters,
    openDetail: handleOpenDetail,
    closeDetail: handleCloseDetail,
    openPhotosModal: handleOpenPhotosModal,
    closePhotosModal: handleClosePhotosModal,
    uploadPhoto: handleUploadPhoto,
    deletePhoto: handleDeletePhoto,
  }
}
