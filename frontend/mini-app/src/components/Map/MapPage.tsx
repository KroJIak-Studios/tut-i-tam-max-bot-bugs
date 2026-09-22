import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MapEvent, MapZone, MapFilterState, NavTabId } from '../../types'
import {
  getMapEvents,
  getMapZones,
  toggleEventAttendance,
} from '../../services/mapService'
import { MapTopBar } from './MapTopBar'
import { MapFilterChips } from './MapFilterChips'
import { MapView } from './MapView'
import { MapTimeSlider } from './MapTimeSlider'
import { MapFilterSheet } from './MapFilterSheet'
import { BottomNavigation } from '../BottomNavigation'
import styles from './MapPage.module.css'

const DEFAULT_FILTERS: MapFilterState = {
  quickChip: 'today',
  category: 'all',
  dateFilter: 'today',
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

  // Data states
  const [events, setEvents] = useState<MapEvent[]>([])
  const [zones, setZones] = useState<MapZone[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filters state
  const [filters, setFilters] = useState<MapFilterState>(DEFAULT_FILTERS)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)

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

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.category !== 'all') count++
    if (filters.isFreeOnly) count++
    if (filters.maxPrice !== null) count++
    if (filters.pushkinCardOnly) count++
    if (filters.volunteerOnly) count++
    if (filters.source !== 'all') count++
    if (filters.minAttendees > 0) count++
    return count
  }, [filters])

  // Quick chips toggle
  const handleToggleQuickChip = (chip: MapFilterState['quickChip']) => {
    setFilters((prev) => ({
      ...prev,
      quickChip: prev.quickChip === chip ? 'all' : chip,
    }))
  }

  // Time slider change
  const handleTimeChange = (minutes: number) => {
    setFilters((prev) => ({
      ...prev,
      timeSlotMinutes: minutes,
    }))
  }

  // Event Selection
  const handleSelectEvent = useCallback((event: MapEvent) => {
    setSelectedEventId(event.id)
  }, [])

  const handleDeselect = useCallback(() => {
    setSelectedEventId(null)
  }, [])

  // Attendance toggle
  const handleToggleGoing = async (eventId: string) => {
    try {
      const updated = await toggleEventAttendance(eventId)
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? updated : e))
      )
    } catch (err) {
      console.error('Failed to toggle attendance:', err)
    }
  }

  // Selected event object
  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || null
  }, [events, selectedEventId])

  // Navigation tab change
  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') {
      navigate('/')
    }
  }

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Header карты */}
      <MapTopBar />

      {/* 2. Быстрые чипы */}
      <MapFilterChips
        filters={filters}
        activeFilterCount={activeFilterCount}
        onToggleQuickChip={handleToggleQuickChip}
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
          <span>Нет событий по выбранным фильтрам</span>
          <button
            type="button"
            className={styles.emptyResetBtn}
            onClick={() => {
              setLoading(true)
              setFilters(DEFAULT_FILTERS)
            }}
          >
            Сбросить
          </button>
        </div>
      )}

      {/* 3. Интерактивная карта (Leaflet) */}
      <div className={styles.mapArea}>
        <MapView
          events={events}
          zones={zones}
          selectedEventId={selectedEvent?.id ?? null}
          selectedEvent={selectedEvent}
          onSelectEvent={handleSelectEvent}
          onDeselect={handleDeselect}
          onToggleGoing={handleToggleGoing}
          onMoreDetails={(e) => {
            console.log('Open event details (future route):', e.id)
          }}
        />
      </div>

      {/* 4. Ползунок времени (Сейчас -> Поздний вечер) */}
      <MapTimeSlider
        currentMinutes={filters.timeSlotMinutes}
        onChangeMinutes={handleTimeChange}
      />

      {/* 5. Нижняя навигация */}
      <BottomNavigation
        activeTab="map"
        onTabChange={handleTabChange}
      />

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
