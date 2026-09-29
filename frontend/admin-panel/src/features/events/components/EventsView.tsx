import React, { useState } from 'react'
import { LayoutGrid, List, AlertCircle, CalendarOff, RefreshCw } from 'lucide-react'
import { useEvents } from '../hooks/useEvents'
import { EventsHeader } from './EventsHeader'
import { EventsFilters } from './EventsFilters'
import { EventsCard } from './EventsCard'
import { EventsTable } from './EventsTable'
import { EventDetailModal } from './EventDetailModal'
import { EventPhotosModal } from './EventPhotosModal'
import styles from './EventsView.module.css'

export const EventsView: React.FC = () => {
  const {
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
    refresh,
    updateFilters,
    resetFilters,
    openDetail,
    closeDetail,
    openPhotosModal,
    closePhotosModal,
    savePhotos,
  } = useEvents()

  // Default to cards on small screens, table on larger screens
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  return (
    <div className={styles.container}>
      <EventsHeader stats={stats} isLoading={isLoading} onRefresh={refresh} />

      <EventsFilters
        filters={filters}
        cities={cities}
        categories={categories}
        onUpdateFilters={updateFilters}
        onResetFilters={resetFilters}
      />

      {error ? (
        <div className={styles.errorState} role="alert">
          <AlertCircle size={32} color="#ef4444" aria-hidden="true" />
          <h2 className={styles.errorTitle}>Ошибка загрузки</h2>
          <p className={styles.errorText}>{error}</p>
          <button
            type="button"
            className={styles.emptyActionBtn}
            onClick={refresh}
          >
            Попробовать снова
          </button>
        </div>
      ) : isLoading ? (
        <div className={styles.loadingBox} aria-live="polite">
          <div className={styles.spinner} aria-hidden="true" />
          <span>Загрузка мероприятий...</span>
        </div>
      ) : isUnavailable || filteredEvents.length === 0 ? (
        <div className={styles.emptyState}>
          <CalendarOff size={40} className={styles.emptyIcon} aria-hidden="true" />
          <h2 className={styles.emptyTitle}>
            {isUnavailable
              ? 'Каталог мероприятий пуст или синхронизируется'
              : 'Мероприятия не найдены'}
          </h2>
          <p className={styles.emptyText}>
            {isUnavailable
              ? 'Серверный каталог событий синхронизируется с базой данных. Вы можете обновить страницу или проверить статус позже.'
              : 'По выбранным фильтрам и условиям поиска событий не обнаружено. Попробуйте сбросить параметры фильтрации.'}
          </p>
          {isUnavailable ? (
            <button
              type="button"
              className={styles.emptyActionBtn}
              onClick={refresh}
            >
              <RefreshCw size={15} aria-hidden="true" />
              <span>Обновить данные</span>
            </button>
          ) : (
            <button
              type="button"
              className={styles.emptyActionBtn}
              onClick={resetFilters}
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={styles.viewControlsRow}>
            <span className={styles.countLabel}>
              Найдено мероприятий: {filteredEvents.length}
            </span>

            <div className={styles.viewModeToggle} role="group" aria-label="Вид отображения">
              <button
                type="button"
                className={`${styles.viewModeBtn} ${
                  viewMode === 'grid' ? styles.viewModeBtnActive : ''
                }`}
                onClick={() => setViewMode('grid')}
                title="Отображать карточками"
                aria-label="Вид сеткой карточек"
              >
                <LayoutGrid size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${styles.viewModeBtn} ${
                  viewMode === 'table' ? styles.viewModeBtnActive : ''
                }`}
                onClick={() => setViewMode('table')}
                title="Отображать таблицей"
                aria-label="Вид таблицей"
              >
                <List size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {viewMode === 'table' ? (
            <EventsTable
              events={filteredEvents}
              cities={cities}
              categories={categories}
              onOpenDetail={openDetail}
              onOpenPhotos={openPhotosModal}
            />
          ) : (
            <div className={styles.cardsGrid}>
              {filteredEvents.map((event) => (
                <EventsCard
                  key={event.id}
                  event={event}
                  cities={cities}
                  categories={categories}
                  onOpenDetail={openDetail}
                  onOpenPhotos={openPhotosModal}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Event Details Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isDetailOpen}
        cities={cities}
        categories={categories}
        onClose={closeDetail}
        onOpenPhotos={openPhotosModal}
      />

      {/* Event Photos Modal (PATCH /admin/events/{event_id}/photos) */}
      <EventPhotosModal
        key={selectedEvent ? `photos-${selectedEvent.id}-${isPhotosModalOpen}` : 'photos-none'}
        event={selectedEvent}
        isOpen={isPhotosModalOpen}
        isSaving={isSavingPhotos}
        error={photosError}
        onClose={closePhotosModal}
        onSave={savePhotos}
      />
    </div>
  )
}
