import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { MapEvent, MapFilterState, NavTabId, CatalogSort } from '../../types'
import { getCatalogEvents, getEventCategories, type EventCategoryRecord } from '../../services/mapService'
import { getCities, chooseInitialCity, type CityRecord } from '../../services/cityService'
import { apiRequest } from '../../services/api'
import { getEventCategoryName } from '../../services/eventCategoryService'
import { FALLBACK_LOCALE } from '../../i18n'
import { DEFAULT_FILTERS, countExtraFilters } from '../../services/eventFilters'
import { USER_CURRENT_LOCATION } from '../../mocks/mapData'
import { calculateDistanceMeters } from '../../utils/geoUtils'
import { getIsoDate } from '../../utils/dateUtils'
import { getEventStart } from '../../utils/eventTime'
import { CatalogTopBar } from './CatalogTopBar'
import { CatalogFilterBar } from './CatalogFilterBar'
import { CatalogEventCard } from './CatalogEventCard'
import { CatalogSortDropdown } from './CatalogSortDropdown'
import { CatalogEmptyState } from './CatalogEmptyState'
import { MapDatePickerSheet, type DatePreset } from '../Map/MapDatePickerSheet'
import { MapFilterSheet } from '../Map/MapFilterSheet'
import { BottomNavigation } from '../BottomNavigation'
import styles from './CatalogPage.module.css'

interface EventWithDistance { event: MapEvent; distanceMeters: number }

export const CatalogPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<MapFilterState>(() => {
    const initial = { ...DEFAULT_FILTERS, dateFilter: 'all' as const, selectedDate: 'all' }
    const pushkin = searchParams.get('pushkin') === 'true'
    const free = searchParams.get('free') === 'true'
    const categoryId = Number(searchParams.get('category_id'))
    if (pushkin) initial.pushkinCardOnly = true
    if (free) initial.isFreeOnly = true
    if (Number.isInteger(categoryId) && categoryId > 0) initial.category = categoryId
    return initial
  })
  const [rawEvents, setRawEvents] = useState<MapEvent[]>([])
  const [categories, setCategories] = useState<EventCategoryRecord[]>([])
  const [, setCities] = useState<CityRecord[]>([])
  const [cityId, setCityId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [sortOrder, setSortOrder] = useState<CatalogSort>('date')
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [requestVersion, setRequestVersion] = useState(0)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([getEventCategories(), getCities(), new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null)
      navigator.geolocation.getCurrentPosition((position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }), () => resolve(null), { enableHighAccuracy: true, timeout: 15_000, maximumAge: 10_000 })
    })]).then(([categoryItems, cityItems, point]) => {
      if (!active) return
      setCategories(categoryItems)
      setCities(cityItems)
      const selectedCity = chooseInitialCity(cityItems, point ? { ...point, accuracy: 0 } : null)
      setCityId(selectedCity?.id ?? null)
      if (selectedCity) void apiRequest('/me', { method: 'PATCH', body: JSON.stringify({ city_id: selectedCity.id }) })
    }).catch(() => { if (active) setHasError(true) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    const selectedDate = filters.dateFilter === 'all' ? undefined : filters.selectedDate
    const startsAfter = selectedDate && selectedDate !== 'all' ? `${selectedDate}T00:00:00Z` : undefined
    const startsBefore = selectedDate && selectedDate !== 'all' ? `${selectedDate}T23:59:59Z` : undefined
    getCatalogEvents({
      cityId: cityId ?? undefined,
      categoryId: filters.category === 'all' ? null : filters.category,
      source: filters.source,
      free: filters.isFreeOnly ? true : undefined,
      pushkin: filters.pushkinCardOnly ? true : undefined,
      startsAfter,
      startsBefore,
      limit: 20,
      offset,
    }).then((items) => {
      if (!active) return
      setRawEvents((current) => offset === 0 ? items : [...current, ...items])
      setHasMore(items.length === 20)
      setHasError(false)
      setLoading(false)
    }).catch(() => {
      if (!active) return
      setHasError(true)
      setLoading(false)
    })
    return () => { active = false }
  }, [filters, offset, requestVersion, cityId])

  const sortedEvents: EventWithDistance[] = useMemo(() => {
    const [userLat, userLon] = USER_CURRENT_LOCATION
    const list = rawEvents.filter((event) => !event.isPast).map((event) => ({
      event,
      distanceMeters: calculateDistanceMeters(userLat, userLon, event.latitude, event.longitude),
    }))
    switch (sortOrder) {
      case 'distance': return list.sort((a, b) => a.distanceMeters - b.distanceMeters)
      case 'date': return list.sort((a, b) => getEventStart(a.event).getTime() - getEventStart(b.event).getTime())
      case 'popular': return list.sort((a, b) => b.event.attendeesCount - a.event.attendeesCount)
      case 'price': return list.sort((a, b) => a.event.price - b.event.price)
      default: return list
    }
  }, [rawEvents, sortOrder])

  const extraFilterCount = useMemo(() => countExtraFilters(filters), [filters])
  const handleToggleFree = useCallback(() => setFilters((prev) => ({ ...prev, isFreeOnly: !prev.isFreeOnly, pushkinCardOnly: false, quickChip: !prev.isFreeOnly ? 'free' : 'all' })), [])
  const handleSelectDate = useCallback((isoDate: string, preset?: DatePreset) => {
    setFilters((prev) => ({ ...prev, selectedDate: isoDate, dateFilter: preset === 'weekend' ? 'weekend' : preset === 'tomorrow' ? 'tomorrow' : preset === 'today' ? 'today' : 'all' }))
  }, [])
  const handleApplyFilters = useCallback((newFilters: MapFilterState) => { setOffset(0); setFilters(newFilters) }, [])
  const handleResetFilters = useCallback(() => { setOffset(0); setFilters({ ...DEFAULT_FILTERS, dateFilter: 'all', selectedDate: 'all' }) }, [])
  const handleCardClick = useCallback((id: string) => navigate(`/events/${id}`), [navigate])
  const handleMapClick = useCallback((id: string) => navigate(`/map?event=${id}`), [navigate])
  const handleTabChange = useCallback((tab: NavTabId) => {
    if (tab === 'home') navigate('/')
    else if (tab === 'chat') navigate('/chat')
    else if (tab === 'map') navigate('/map')
    else if (tab === 'plans') navigate('/plans')
    else if (tab === 'profile') navigate('/profile')
  }, [navigate])

  const hasActiveFilters = extraFilterCount > 0 || filters.isFreeOnly || filters.pushkinCardOnly || filters.selectedDate !== 'all'
  const categoriesById = useMemo(() => new Map(categories.map((category) => [String(category.id), getEventCategoryName(category, i18n.language, FALLBACK_LOCALE)])), [categories, i18n.language])
  const eventsWithNames = useMemo(() => sortedEvents.map(({ event, distanceMeters }) => ({ event: { ...event, categoryName: event.categoryId == null ? null : categoriesById.get(String(event.categoryId)) || null }, distanceMeters })), [sortedEvents, categoriesById])

  return <div className={styles.pageContainer}>
    <CatalogTopBar />
    <main className={styles.scrollArea}>
      <div className={styles.contentWrapper}>
        <div className={styles.filterBarSection}>
          <CatalogFilterBar selectedDate={filters.selectedDate === 'all' ? getIsoDate(0) : filters.selectedDate} allDates={filters.dateFilter === 'all'} isFreeOnly={filters.isFreeOnly} extraFilterCount={extraFilterCount} onOpenDatePicker={() => setIsDatePickerOpen(true)} onToggleFree={handleToggleFree} onOpenFilterSheet={() => setIsFilterSheetOpen(true)} />
        </div>
        {!loading && !hasError && cityId !== null && eventsWithNames.length > 0 && <div className={styles.listMetaRow}><span className={styles.countText}>{t('catalog.foundEvents', { count: eventsWithNames.length })}</span><CatalogSortDropdown value={sortOrder} onChange={setSortOrder} /></div>}
        {loading && <div className={styles.loadingSkeletonList}>{[1, 2, 3].map((i) => <div key={i} className={styles.skeletonCard}><div className={styles.skeletonImage} /><div className={styles.skeletonContent}><div className={styles.skeletonLineShort} /><div className={styles.skeletonLineTitle} /><div className={styles.skeletonLineMedium} /></div></div>)}</div>}
        {!loading && hasError && <div className={styles.errorContainer} role="alert"><p className={styles.errorText}>{t('catalog.loadError')}</p><button type="button" className={styles.retryBtn} onClick={() => setRequestVersion((value) => value + 1)}>{t('common.retry')}</button></div>}
        {!loading && !hasError && cityId === null && <CatalogEmptyState onResetFilters={handleResetFilters} hasActiveFilters={false} />}
        {!loading && !hasError && cityId !== null && eventsWithNames.length === 0 && <CatalogEmptyState onResetFilters={handleResetFilters} hasActiveFilters={hasActiveFilters} />}
        {!loading && !hasError && cityId !== null && eventsWithNames.length > 0 && <><div className={styles.cardsList}>{eventsWithNames.map(({ event, distanceMeters }) => <CatalogEventCard key={event.id} event={event} distanceMeters={distanceMeters} onCardClick={handleCardClick} onMapClick={handleMapClick} />)}</div>{hasMore && <button type="button" className={styles.retryBtn} onClick={() => setOffset((value) => value + 20)}>{t('catalog.loadMore')}</button>}</> }
      </div>
    </main>
    {isDatePickerOpen && <MapDatePickerSheet selectedDate={filters.selectedDate === 'all' ? getIsoDate(0) : filters.selectedDate} activePreset={filters.dateFilter} onClose={() => setIsDatePickerOpen(false)} onSelectDate={(iso, preset) => { handleSelectDate(iso, preset); setIsDatePickerOpen(false) }} />}
    {isFilterSheetOpen && <MapFilterSheet filters={filters} categories={categories} onClose={() => setIsFilterSheetOpen(false)} onApply={handleApplyFilters} onReset={handleResetFilters} />}
    <BottomNavigation activeTab="none" onTabChange={handleTabChange} />
  </div>
}
