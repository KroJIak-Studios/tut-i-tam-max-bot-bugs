import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { MapEvent, MapZone, MapFilterState, NavTabId, EventCategory } from '../../types'
import { getMapEvents, getMapZones } from '../../services/mapService'
import { INITIAL_MAP_EVENTS } from '../../mocks/mapData'
import { getIsoDate, formatChipDate } from '../../utils/dateUtils'
import { useAttendance } from '../../context/useAttendance'
import { MapTopBar } from './MapTopBar'
import { MapFilterChips } from './MapFilterChips'
import { MapDatePickerSheet } from './MapDatePickerSheet'
import { MapView } from './MapView'
import { MapTimeSlider } from './MapTimeSlider'
import { MapFilterSheet } from './MapFilterSheet'
import { BottomNavigation } from '../BottomNavigation'
import styles from './MapPage.module.css'

const DEFAULT_FILTERS: MapFilterState = {
  quickChip: 'all',
  category: 'all',
  dateFilter: 'today',
  selectedDate: getIsoDate(0),
  isFreeOnly: false,
  maxPrice: null,
  pushkinCardOnly: false,
  volunteerOnly: false,
  minAttendees: 0,
  source: 'all',
  timeSlotMinutes: 18 * 60, // 18:00
}

export const MapPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Data states
  const [events, setEvents] = useState<MapEvent[]>([])
  const [zones, setZones] = useState<MapZone[]>([])
  const eventParam = searchParams.get('event')
  const [userSelectedId, setUserSelectedId] = useState<string | null | undefined>(undefined)
  const selectedEventId = userSelectedId !== undefined ? userSelectedId : eventParam
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filters state initialized from query params
  const [filters, setFilters] = useState<MapFilterState>(() => {
    const pushkin = searchParams.get('pushkin') === 'true'
    const categoryParam = searchParams.get('category')
    const eventIdParam = searchParams.get('event')

    const initial = { ...DEFAULT_FILTERS }
    if (pushkin) {
      initial.pushkinCardOnly = true
    }
    if (categoryParam) {
      if (categoryParam === 'volunteer') {
        initial.category = 'volunteer'
        initial.volunteerOnly = true
      } else {
        initial.category = categoryParam as EventCategory
      }
    }
    if (eventIdParam) {
      const found = INITIAL_MAP_EVENTS.find(
        (e) => e.id === eventIdParam || e.aliasIds?.includes(eventIdParam)
      )
      if (found && found.date) {
        initial.selectedDate = found.date
        if (found.date !== getIsoDate(0)) {
          initial.timeSlotMinutes = 9 * 60
        }
      }
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
    const categoryParam = searchParams.get('category')
    const eventIdParam = searchParams.get('event')

    if (pushkin || categoryParam || eventIdParam) {
      const updated = { ...filters }
      if (pushkin) {
        updated.pushkinCardOnly = true
      }
      if (categoryParam) {
        if (categoryParam === 'volunteer') {
          updated.category = 'volunteer'
          updated.volunteerOnly = true
        } else {
          updated.category = categoryParam as EventCategory
        }
      }
      if (eventIdParam) {
        const found = INITIAL_MAP_EVENTS.find(
          (e) => e.id === eventIdParam || e.aliasIds?.includes(eventIdParam)
        )
        if (found && found.date) {
          updated.selectedDate = found.date
          if (found.date !== getIsoDate(0)) {
            updated.timeSlotMinutes = 9 * 60
          }
        }
      }
      setFilters(updated)
    }
  }

  const isToday = filters.selectedDate === getIsoDate(0)

  // Load Zones once
  useEffect(() => {
    getMapZones()
      .then(setZones)
      .catch((err) => console.error('Failed to load zones:', err))
  }, [])

  // Load Events when filters change
  useEffect(() => {
    let active = true

    getMapEvents(filters)
      .then((data) => {
        if (!active) return
        setEvents(data)
        setLoading(false)
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        console.error(err)
        setError('Не удалось загрузить данные карты')
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filters])

  // Count active non-default filters excluding quick buttons (today & free)
  const extraFilterCount = useMemo(() => {
    let count = 0
    if (filters.category !== 'all') count++
    if (filters.maxPrice !== null) count++
    if (filters.pushkinCardOnly) count++
    if (filters.volunteerOnly) count++
    if (filters.source !== 'all') count++
    if (filters.minAttendees > 0) count++
    return count
  }, [filters])

  // Time slider change
  const handleTimeChange = (minutes: number) => {
    setFilters((prev) => ({
      ...prev,
      timeSlotMinutes: minutes,
    }))
  }

  // Event Selection
  const handleSelectEvent = useCallback((event: MapEvent) => {
    setUserSelectedId(event.id)
  }, [])

  const handleDeselect = useCallback(() => {
    setUserSelectedId(null)
  }, [])

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

  // Date selection change
  const handleDateChange = (newIsoDate: string) => {
    const isNewToday = newIsoDate === getIsoDate(0)
    setUserSelectedId(null)
    setFilters((prev) => ({
      ...prev,
      selectedDate: newIsoDate,
      timeSlotMinutes: isNewToday ? 18 * 60 : 9 * 60,
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
      {/* 1. Header карты */}
      <MapTopBar />

      {/* 2. Быстрые чипы с выбором даты */}
      <MapFilterChips
        selectedDate={filters.selectedDate}
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
          <span>Обновление карты...</span>
        </div>
      )}

      {/* Баннер ошибки */}
      {error && (
        <div className={styles.emptyBanner}>
          <span>{error}</span>
          <button
            type="button"
            className={styles.emptyResetBtn}
            onClick={() => {
              setLoading(true)
              setFilters({ ...filters })
            }}
          >
            Повторить
          </button>
        </div>
      )}

      {/* Баннер пустого результата при фильтрах */}
      {!loading && !error && events.length === 0 && (
        <div className={styles.emptyBanner}>
          <span>
            {!isToday
              ? `На ${formatChipDate(filters.selectedDate)} событий не найдено`
              : 'Нет событий по выбранным фильтрам'}
          </span>
          <button
            type="button"
            className={styles.emptyResetBtn}
            onClick={() => {
              setLoading(true)
              setFilters(DEFAULT_FILTERS)
            }}
          >
            {!isToday ? 'Показать сегодня' : 'Сбросить'}
          </button>
        </div>
      )}

      {/* 3. Интерактивная карта (Leaflet) */}
      <div className={styles.mapArea}>
        <MapView
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

      {/* 4. Ползунок времени (Сейчас / Утро -> Поздний вечер) */}
      <MapTimeSlider
        currentMinutes={filters.timeSlotMinutes}
        onChangeMinutes={handleTimeChange}
        isToday={isToday}
      />

      {/* 5. Нижняя навигация */}
      <BottomNavigation
        activeTab="map"
        onTabChange={handleTabChange}
      />

      {/* Bottom Sheet выбора даты */}
      {isDatePickerOpen && (
        <MapDatePickerSheet
          selectedDate={filters.selectedDate}
          onClose={() => setIsDatePickerOpen(false)}
          onSelectDate={handleDateChange}
        />
      )}

      {/* Bottom Sheet полных фильтров */}
      {isFilterSheetOpen && (
        <MapFilterSheet
          filters={filters}
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
