import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MapEvent, MapZone, MapFilterState, NavTabId } from '../../types'
import {
  getMapEvents,
  getMapZones,
  toggleEventAttendance,
  addUserMarker,
} from '../../services/mapService'
import { MapTopBar } from './MapTopBar'
import { MapFilterChips } from './MapFilterChips'
import { MapView } from './MapView'
import { MapEventCard } from './MapEventCard'
import { MapTimeSlider } from './MapTimeSlider'
import { MapFilterSheet } from './MapFilterSheet'
import { AddMarkerSheet } from './AddMarkerSheet'
import { BottomNavigation } from '../BottomNavigation'
import { IconPlus } from '../Icons'
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
  const [selectedEventId, setSelectedEventId] = useState<string | null>('event-naberezhnaya')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filters state
  const [filters, setFilters] = useState<MapFilterState>(DEFAULT_FILTERS)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)

  // Add marker state
  const [isAddingMarkerMode, setIsAddingMarkerMode] = useState(false)
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isAddMarkerSheetOpen, setIsAddMarkerSheetOpen] = useState(false)

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

  // Adding marker handlers
  const handleToggleAddMode = () => {
    setIsAddingMarkerMode((prev) => !prev)
    setSelectedEventId(null)
  }

  const handleMapClickForAdd = (lat: number, lng: number) => {
    setPendingCoords({ lat, lng })
    setIsAddingMarkerMode(false)
    setIsAddMarkerSheetOpen(true)
  }

  const handleAddMarkerSubmit = async (formData: {
    title: string
    category: MapEvent['category']
    startTime: string
    description?: string
  }) => {
    if (!pendingCoords) return
    try {
      const created = await addUserMarker({
        title: formData.title,
        category: formData.category,
        startTime: formData.startTime,
        latitude: pendingCoords.lat,
        longitude: pendingCoords.lng,
        description: formData.description,
      })
      setIsAddMarkerSheetOpen(false)
      setPendingCoords(null)
      // Refresh list with new marker included
      setEvents((prev) => [created, ...prev])
      setSelectedEventId(created.id)
    } catch (err) {
      console.error('Failed to create marker:', err)
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

      {/* Toast режима добавления метки */}
      {isAddingMarkerMode && (
        <div className={styles.modeToast}>
          <span>Нажмите на карту, чтобы установить метку</span>
          <button
            type="button"
            className={styles.modeToastCancel}
            onClick={() => setIsAddingMarkerMode(false)}
          >
            Отмена
          </button>
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
          selectedEventId={selectedEventId}
          isAddingMarkerMode={isAddingMarkerMode}
          onSelectEvent={handleSelectEvent}
          onMapClick={handleMapClickForAdd}
          onDeselect={handleDeselect}
        />
      </div>

      {/* 4. Плавающая кнопка добавления пользовательской метки */}
      <button
        type="button"
        className={`${styles.floatingPlusButton} ${isAddingMarkerMode ? styles.floatingPlusButtonActive : ''}`}
        onClick={handleToggleAddMode}
        aria-label="Добавить метку на карту"
        title="Добавить свою метку"
      >
        <IconPlus size={22} color="currentColor" />
      </button>

      {/* 5. Карточка выбранного мероприятия */}
      {selectedEvent && (
        <MapEventCard
          event={selectedEvent}
          onToggleGoing={handleToggleGoing}
          onMoreDetails={(e) => {
            console.log('Open event details (future route):', e.id)
          }}
        />
      )}

      {/* 6. Ползунок времени (Сейчас -> Поздний вечер) */}
      <MapTimeSlider
        currentMinutes={filters.timeSlotMinutes}
        onChangeMinutes={handleTimeChange}
      />

      {/* 7. Нижняя навигация */}
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

      {/* Bottom Sheet добавления метки */}
      {pendingCoords && (
        <AddMarkerSheet
          latitude={pendingCoords.lat}
          longitude={pendingCoords.lng}
          isOpen={isAddMarkerSheetOpen}
          onClose={() => {
            setIsAddMarkerSheetOpen(false)
            setPendingCoords(null)
          }}
          onSubmit={handleAddMarkerSubmit}
        />
      )}
    </div>
  )
}
