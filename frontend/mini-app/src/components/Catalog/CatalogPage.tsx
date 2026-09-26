import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { MapEvent, MapFilterState, NavTabId, EventCategory, CatalogSort } from '../../types'
import { getMapEvents } from '../../services/mapService'
import { DEFAULT_FILTERS, countExtraFilters } from '../../services/eventFilters'
import { USER_CURRENT_LOCATION } from '../../mocks/mapData'
import { calculateDistanceMeters } from '../../utils/geoUtils'
import { getIsoDate } from '../../utils/dateUtils'
import { CatalogTopBar } from './CatalogTopBar'
import { CatalogFilterBar } from './CatalogFilterBar'
import { CatalogEventCard } from './CatalogEventCard'
import { CatalogSortDropdown } from './CatalogSortDropdown'
import { CatalogEmptyState } from './CatalogEmptyState'
import { MapDatePickerSheet } from '../Map/MapDatePickerSheet'
import { MapFilterSheet } from '../Map/MapFilterSheet'
import { BottomNavigation } from '../BottomNavigation'
import styles from './CatalogPage.module.css'

interface EventWithDistance {
  event: MapEvent
  distanceMeters: number
}

export const CatalogPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Initialize filters from query params if present, otherwise default
  const [filters, setFilters] = useState<MapFilterState>(() => {
    const pushkin = searchParams.get('pushkin') === 'true'
    const categoryParam = searchParams.get('category')
    const freeParam = searchParams.get('free') === 'true'

    const initial = { ...DEFAULT_FILTERS }
    if (pushkin) initial.pushkinCardOnly = true
    if (freeParam) initial.isFreeOnly = true
    if (categoryParam) {
      if (categoryParam === 'volunteer') {
        initial.category = 'volunteer'
        initial.volunteerOnly = true
      } else {
        initial.category = categoryParam as EventCategory
      }
    }
    return initial
  })

  const [rawEvents, setRawEvents] = useState<MapEvent[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [hasError, setHasError] = useState<boolean>(false)
  const [sortOrder, setSortOrder] = useState<CatalogSort>('distance')

  // Sheets state
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Fetch events when filters change
  useEffect(() => {
    let active = true

    getMapEvents(filters)
      .then((data) => {
        if (!active) return
        setRawEvents(data)
        setLoading(false)
        setHasError(false)
      })
      .catch((err) => {
        if (!active) return
        console.error('Failed to load catalog events:', err)
        setHasError(true)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filters])

  // Process events: calculate distance, filter out past events, sort according to sortOrder
  const sortedEvents: EventWithDistance[] = useMemo(() => {
    const userLat = USER_CURRENT_LOCATION[0]
    const userLon = USER_CURRENT_LOCATION[1]

    const list = rawEvents
      .filter((e) => !e.isPast)
      .map((event) => {
        const distanceMeters = calculateDistanceMeters(
          userLat,
          userLon,
          event.latitude,
          event.longitude
        )
        return { event, distanceMeters }
      })

    switch (sortOrder) {
      case 'distance':
        return list.sort((a, b) => a.distanceMeters - b.distanceMeters)
      case 'date':
        return list.sort((a, b) => {
          if (a.event.date !== b.event.date) {
            return a.event.date.localeCompare(b.event.date)
          }
          return a.event.startTime.localeCompare(b.event.startTime)
        })
      case 'popular':
        return list.sort((a, b) => b.event.attendeesCount - a.event.attendeesCount)
      case 'price':
        return list.sort((a, b) => a.event.price - b.event.price)
      default:
        return list
    }
  }, [rawEvents, sortOrder])

  // Count active non-default filters for the "Фильтры" badge
  const extraFilterCount = useMemo(() => countExtraFilters(filters), [filters])

  // Filter actions
  const handleToggleFree = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      isFreeOnly: !prev.isFreeOnly,
      quickChip: !prev.isFreeOnly ? 'free' : 'all',
    }))
  }, [])

  const handleSelectDate = useCallback((isoDate: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedDate: isoDate,
    }))
  }, [])

  const handleApplyFilters = useCallback((newFilters: MapFilterState) => {
    setFilters(newFilters)
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const handleShowToday = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      selectedDate: getIsoDate(0),
    }))
  }, [])

  // Navigation handlers
  const handleCardClick = useCallback((eventId: string) => {
    navigate(`/events/${eventId}`)
  }, [navigate])

  const handleMapClick = useCallback((eventId: string) => {
    navigate(`/map?event=${eventId}`)
  }, [navigate])

  const handleTabChange = useCallback((tab: NavTabId) => {
    if (tab === 'home') {
      navigate('/')
    } else if (tab === 'chat') {
      navigate('/chat')
    } else if (tab === 'map') {
      navigate('/map')
    } else if (tab === 'plans') {
      navigate('/plans')
    } else if (tab === 'profile') {
      navigate('/profile')
    }
  }, [navigate])

  const hasActiveFilters = extraFilterCount > 0 || filters.isFreeOnly || filters.selectedDate !== getIsoDate(0)

  return (
    <div className={styles.pageContainer}>
      {/* 1. Header Каталога (Sticky, tinted background) */}
      <CatalogTopBar />

      {/* 2. Scrollable Content Area */}
      <main className={styles.scrollArea}>
        <div className={styles.contentWrapper}>
          {/* Quick Filters Bar */}
          <div className={styles.filterBarSection}>
            <CatalogFilterBar
              selectedDate={filters.selectedDate}
              isFreeOnly={filters.isFreeOnly}
              extraFilterCount={extraFilterCount}
              onOpenDatePicker={() => setIsDatePickerOpen(true)}
              onToggleFree={handleToggleFree}
              onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
            />
          </div>

          {/* List Meta Row (Result count & sorting indication) */}
          {!loading && !hasError && sortedEvents.length > 0 && (
            <div className={styles.listMetaRow}>
              <span className={styles.countText}>
                {t('catalog.foundEvents', { count: sortedEvents.length })}
              </span>
              <CatalogSortDropdown value={sortOrder} onChange={setSortOrder} />
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className={styles.loadingSkeletonList}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonContent}>
                    <div className={styles.skeletonLineShort} />
                    <div className={styles.skeletonLineTitle} />
                    <div className={styles.skeletonLineMedium} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && hasError && (
            <div className={styles.errorContainer} role="alert">
              <p className={styles.errorText}>{t('catalog.loadError')}</p>
              <button
                type="button"
                className={styles.retryBtn}
                onClick={() => setFilters({ ...filters })}
              >
                {t('common.retry')}
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !hasError && sortedEvents.length === 0 && (
            <CatalogEmptyState
              onResetFilters={handleResetFilters}
              onShowToday={handleShowToday}
              hasActiveFilters={hasActiveFilters}
            />
          )}

          {/* Events List */}
          {!loading && !hasError && sortedEvents.length > 0 && (
            <div className={styles.cardsList}>
              {sortedEvents.map(({ event, distanceMeters }) => (
                <CatalogEventCard
                  key={event.id}
                  event={event}
                  distanceMeters={distanceMeters}
                  onCardClick={handleCardClick}
                  onMapClick={handleMapClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Date Picker Bottom Sheet */}
      {isDatePickerOpen && (
        <MapDatePickerSheet
          selectedDate={filters.selectedDate}
          onClose={() => setIsDatePickerOpen(false)}
          onSelectDate={(iso) => {
            handleSelectDate(iso)
            setIsDatePickerOpen(false)
          }}
        />
      )}

      {/* Filter Bottom Sheet */}
      {isFilterSheetOpen && (
        <MapFilterSheet
          filters={filters}
          onClose={() => setIsFilterSheetOpen(false)}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      )}

      {/* Bottom Navigation (activeTab="none" with inactive compact Map) */}
      <BottomNavigation
        activeTab="none"
        onTabChange={handleTabChange}
      />
    </div>
  )
}
