import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { MapEvent, MapZone, MapFilterState, NavTabId } from '../../types'
import { getEventCategories, getMapEvents, getMapZones } from '../../services/mapService'
import { getCities, type CityRecord } from '../../services/cityService'
import { apiRequest } from '../../services/api'
import type { EventCategoryRecord } from '../../services/mapService'
import { getIsoDate, formatChipDate, getWeekendIsoDate } from '../../utils/dateUtils'
import { getEventStartDate } from '../../utils/eventTime'
import { useAttendance } from '../../context/useAttendance'
import { useGeolocation } from '../../context/GeolocationContext'
import { MapFilterChips } from './MapFilterChips'
import { MapDatePickerSheet, type DatePreset } from './MapDatePickerSheet'
import { MapView } from './MapView'
import { MapFilterSheet } from './MapFilterSheet'
import { MapTimeScrubber } from './MapTimeScrubber'
import { BottomNavigation } from '../BottomNavigation'
import styles from './MapPage.module.css'

const savedMapFilters = { filters: null as MapFilterState | null }

const DEFAULT_FILTERS: MapFilterState = {
  quickChip: 'all',
  category: 'all',
  dateFilter: 'today',
  selectedDate: getIsoDate(0),
  isFreeOnly: false,
  pushkinCardOnly: false,
  minAttendees: 0,
  source: 'all',
  timeSlotMinutes: null,
}

export const MapPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { point: userLocation, status: locationStatus, request: requestLocation, retry: retryLocation, enterMap, leaveMap } = useGeolocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    enterMap()
    return leaveMap
  }, [enterMap, leaveMap])

  // Data states
  const [events, setEvents] = useState<MapEvent[]>([])
  const [zones, setZones] = useState<MapZone[]>([])
  const [categories, setCategories] = useState<EventCategoryRecord[]>([])
  const [currentCity, setCurrentCity] = useState<CityRecord | null>(null)
  const [userSelectedId, setUserSelectedId] = useState<string | null>(null)
  const [dateRangeReady, setDateRangeReady] = useState(savedMapFilters.filters != null || searchParams.get('date') != null)
  const selectedEventId = userSelectedId
  const [loading, setLoading] = useState<boolean>(true)
  const [hasError, setHasError] = useState<boolean>(false)

  // Filters state initialized from query params
  const [filters, setFilters] = useState<MapFilterState>(() => {
    const dateParam = searchParams.get('date')
    if (savedMapFilters.filters) return { ...savedMapFilters.filters, ...(dateParam ? { timeSlotMinutes: null } : {}) }
    const pushkin = searchParams.get('pushkin') === 'true'
    const categoryParam = searchParams.get('category_id')

    const initial = { ...DEFAULT_FILTERS }
    if (pushkin) {
      initial.pushkinCardOnly = true
    }
    const initialCategoryId = Number(categoryParam)
    if (Number.isInteger(initialCategoryId) && initialCategoryId > 0) initial.category = initialCategoryId
    if (dateParam === 'weekend') {
      initial.dateFilter = 'weekend'
      initial.selectedDate = getWeekendIsoDate()
    } else if (dateParam === 'tomorrow') {
      initial.dateFilter = 'tomorrow'
      initial.selectedDate = getIsoDate(1)
    } else if (dateParam === 'today') {
      initial.dateFilter = 'today'
      initial.selectedDate = getIsoDate(0)
    } else if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      initial.dateFilter = dateParam === getIsoDate(0) ? 'today' : 'all'
      initial.selectedDate = dateParam
      initial.dateEnd = dateParam
      initial.timeSlotMinutes = null
    }
    return initial
  })
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Sync searchParams when they change dynamically (React render-phase adjustment)
  const [prevSearchParams, setPrevSearchParams] = useState(searchParams.toString())
  const currentSearchParams = searchParams.toString()

  if (currentSearchParams !== prevSearchParams) {
    setPrevSearchParams(currentSearchParams)
    const pushkin = searchParams.get('pushkin') === 'true'
    const categoryParam = searchParams.get('category_id')
    const dateParam = searchParams.get('date')

    if (pushkin || categoryParam || dateParam) {
      const updated = { ...filters }
      if (pushkin) {
        updated.pushkinCardOnly = true
      }
      const categoryId = Number(categoryParam)
      if (Number.isInteger(categoryId) && categoryId > 0) updated.category = categoryId
      if (dateParam === 'weekend') {
        updated.dateFilter = 'weekend'
        updated.selectedDate = getWeekendIsoDate()
      } else if (dateParam === 'tomorrow') {
        updated.dateFilter = 'tomorrow'
        updated.selectedDate = getIsoDate(1)
      } else if (dateParam === 'today') {
        updated.dateFilter = 'today'
        updated.selectedDate = getIsoDate(0)
        updated.dateEnd = getIsoDate(0)
      } else if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        updated.dateFilter = dateParam === getIsoDate(0) ? 'today' : 'all'
        updated.selectedDate = dateParam
        updated.dateEnd = dateParam
        updated.timeSlotMinutes = null
      }
      setFilters(updated)
    }
  }

  useEffect(() => {
    savedMapFilters.filters = filters
  }, [filters])

  const focusEventId = searchParams.get('event')
  const focusLatitude = Number(searchParams.get('lat'))
  const focusLongitude = Number(searchParams.get('lng'))
  const focusPoint = Number.isFinite(focusLatitude) && Number.isFinite(focusLongitude)
    ? { latitude: focusLatitude, longitude: focusLongitude }
    : null
  const isToday = filters.selectedDate === getIsoDate(0)

  useEffect(() => {
    if (!focusEventId || loading) return
    const match = events.find((event) => event.id === focusEventId)
    if (match) setUserSelectedId(match.id)
  }, [events, focusEventId, loading])

  // Load map support data once
  useEffect(() => {
    Promise.all([apiRequest<{ city: { id: number } | null }>('/me'), getCities(), getEventCategories()]).then(([profile, cities, categoryItems]) => {
      const city = cities.find((item) => item.id === profile.city?.id) ?? null
      setCurrentCity(city)
      setCategories(categoryItems)
      if (city) getMapZones(city.id).then(setZones).catch((error) => console.error('Failed to load city zones:', error))
    }).catch((error) => console.error('Failed to load map context:', error))
  }, [])

  // Load Events when filters change
  useEffect(() => {
    let active = true
    setLoading(true)

    const query = dateRangeReady ? filters : { ...filters, dateFilter: 'all' as const, selectedDate: 'all', dateEnd: undefined, timeSlotMinutes: null }
    getMapEvents(query, currentCity?.id)
      .then((data) => {
        if (!active) return
        if (!dateRangeReady) {
          const today = getIsoDate(0)
          const nearest = data.map((event) => getEventStartDate(event)).filter((date) => date >= today).sort()[0]
          setDateRangeReady(true)
          if (nearest && nearest !== today) {
            setFilters((current) => current.selectedDate === today ? { ...current, dateEnd: nearest, dateFilter: 'all' } : current)
            return
          }
        }
        setEvents(data)
        setLoading(false)
        setHasError(false)
      })
      .catch((err) => {
        if (!active) return
        console.error(err)
        setHasError(true)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filters, currentCity?.id, dateRangeReady])

  // Count active non-default filters excluding quick buttons (today & free)
  const extraFilterCount = useMemo(() => {
    let count = 0
    if (filters.category !== 'all') count++
    if (filters.pushkinCardOnly) count++
    if (filters.source !== 'all') count++
    if (filters.minAttendees > 0) count++
    return count
  }, [filters])

  // Event Selection
  const handleSelectEvent = useCallback((event: MapEvent) => {
    setUserSelectedId(event.id)
  }, [])

  const handleDeselect = useCallback(() => {
    setUserSelectedId(null)
    if (!searchParams.get('event')) return
    const next = new URLSearchParams(searchParams)
    next.delete('event')
    next.delete('lat')
    next.delete('lng')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const { toggleAttendance, attendance } = useAttendance()

  // Attendance toggle
  const handleToggleGoing = async (eventId: string) => {
    try {
      await toggleAttendance(eventId)
    } catch (err) {
      console.error('Failed to toggle attendance:', err)
    }
  }

  // Derive events with attendance context
  const displayedEvents = useMemo(() => {
    return events.map((e) => {
      const going = attendance[e.id] ?? e.isGoing
      return {
        ...e,
        isGoing: going,
        attendeesCount: e.attendeesCount + (going && !e.isGoing ? 1 : 0),
      }
    })
  }, [events, attendance])

  // Selected event object (automatically null if event not in displayedEvents)
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null
    return displayedEvents.find((e) => e.id === selectedEventId) || null
  }, [displayedEvents, selectedEventId])

  // Time scrubber handlers
  const handleTimeChange = useCallback((minutes: number) => {
    setUserSelectedId(null)
    setFilters((prev) => ({
      ...prev,
      timeSlotMinutes: minutes,
    }))
  }, [])

  const hasActiveEventFilters = filters.category !== 'all' || filters.isFreeOnly || filters.pushkinCardOnly || filters.source !== 'all' || filters.minAttendees > 0 || filters.timeSlotMinutes !== null || !isToday

  // Date selection change
  const handleDateChange = (
    newIsoDate: string,
    preset?: DatePreset,
    endDate?: string,
  ) => {
    setUserSelectedId(null)
    setFilters((prev) => ({
      ...prev,
      selectedDate: newIsoDate,
      dateEnd: endDate ?? newIsoDate,
      timeSlotMinutes: null,
      dateFilter:
        preset === 'weekend'
          ? 'weekend'
          : preset === 'tomorrow'
          ? 'tomorrow'
          : preset === 'today'
          ? 'today'
          : 'all',
    }))
  }

  // Navigation tab change
  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') {
      navigate('/')
    } else if (tab === 'chat') {
      navigate('/chat')
    } else if (tab === 'plans') {
      navigate('/plans')
    } else if (tab === 'profile') {
      navigate('/profile')
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <MapFilterChips
        selectedDate={filters.selectedDate}
        dateEnd={filters.dateEnd}
        isFreeOnly={filters.isFreeOnly}
        extraFilterCount={extraFilterCount}
        onOpenDatePicker={() => setIsDatePickerOpen(true)}
        onToggleFree={() => {
          setFilters((prev) => ({
            ...prev,
            isFreeOnly: !prev.isFreeOnly,
          }))
        }}
        onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
      />

      {/* Индикатор загрузки */}
      {loading && (
        <div className={styles.loadingPill}>
          <div className={styles.spinner} />
          <span>{t('map.updating')}</span>
        </div>
      )}

      {/* Баннер ошибки */}
      {hasError && (
        <div className={styles.emptyBanner}>
          <span>{t('map.loadError')}</span>
          <button
            type="button"
            className={styles.emptyResetBtn}
            onClick={() => {
              setLoading(true)
              setFilters({ ...filters })
            }}
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Баннер пустого результата при фильтрах */}
      {!loading && !hasError && events.length === 0 && hasActiveEventFilters && (
        <div className={styles.emptyBanner}>
          <span>
            {filters.timeSlotMinutes !== null && filters.timeSlotMinutes !== undefined
              ? t('map.noEventsAtTime', 'В это время событий не найдено')
              : !isToday
              ? t('map.noEventsOnDate', { date: formatChipDate(filters.selectedDate, i18n.language) })
              : t('map.noEventsForFilters')}
          </span>
          <button
            type="button"
            className={styles.emptyResetBtn}
            onClick={() => {
              setDateRangeReady(false)
              setFilters((current) => ({ ...current, selectedDate: getIsoDate(0), dateEnd: getIsoDate(0), dateFilter: 'today', timeSlotMinutes: null }))
            }}
          >
            {filters.timeSlotMinutes !== null && filters.timeSlotMinutes !== undefined
              ? t('map.resetTime', 'Сбросить время')
              : !isToday
              ? t('map.showToday')
              : t('common.reset')}
          </button>
        </div>
      )}

      {/* 3. Интерактивная карта (Leaflet) */}
      <div className={styles.mapArea}>
        <MapView
          currentCity={currentCity}
          userLocation={userLocation}
          focusPoint={focusPoint}
          locationStatus={locationStatus}
          locationHintOffset={hasError || (!loading && events.length === 0 && hasActiveEventFilters)}
          hideLocationHint={loading}
          timeControls={!filters.dateEnd || filters.dateEnd === filters.selectedDate}
          onRequestLocation={requestLocation}
          onRetryLocation={retryLocation}
          events={displayedEvents}
          zones={zones}
          selectedEventId={selectedEvent?.id ?? null}
          selectedEvent={selectedEvent}
          onSelectEvent={handleSelectEvent}
          onDeselect={handleDeselect}
          onToggleGoing={handleToggleGoing}
          onMoreDetails={(e) => {
            navigate(`/events/${e.id}`)
          }}
        />
      </div>

      {/* 4. Временная шкала событий */}
      {(!filters.dateEnd || filters.dateEnd === filters.selectedDate) && (
        <MapTimeScrubber
          selectedMinutes={filters.timeSlotMinutes ?? null}
          onChangeMinutes={handleTimeChange}
          isToday={isToday}
        />
      )}

      {/* Нижняя навигация */}
      <BottomNavigation
        activeTab="map"
        onTabChange={handleTabChange}
      />

      {/* Bottom Sheet выбора даты */}
      {isDatePickerOpen && (
        <MapDatePickerSheet
          selectedDate={filters.selectedDate}
          dateEnd={filters.dateEnd}
          activePreset={filters.dateFilter}
          onClose={() => setIsDatePickerOpen(false)}
          onSelectDate={handleDateChange}
        />
      )}

      {/* Bottom Sheet полных фильтров */}
      {isFilterSheetOpen && (
        <MapFilterSheet
          filters={filters}
          categories={categories}
          onClose={() => setIsFilterSheetOpen(false)}
          onApply={(newFilters) => {
            setLoading(true)
            setFilters(newFilters)
          }}
          onReset={() => {
            setLoading(true)
            setFilters(DEFAULT_FILTERS)
          }}
        />
      )}
    </div>
  )
}
