import React, { useState } from 'react'
import {
  LayoutGrid,
  List,
  AlertCircle,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
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
    events,
    cities,
    categories,
    stats,
    isLoading,
    error,
    filters,
    page,
    total,
    totalPages,
    selectedEvent,
    isDetailOpen,
    isLoadingDetail,
    isPhotosModalOpen,
    isMutatingPhoto,
    photosError,
    setPage,
    refresh,
    updateFilters,
    resetFilters,
    openDetail,
    closeDetail,
    openPhotosModal,
    closePhotosModal,
    uploadPhoto,
    deletePhoto,
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
      ) : events.length === 0 ? (
        <div className={styles.emptyState}>
          <CalendarOff size={40} className={styles.emptyIcon} aria-hidden="true" />
          <h2 className={styles.emptyTitle}>Мероприятия не найдены</h2>
          <p className={styles.emptyText}>
            По выбранным фильтрам и параметрам поиска событий не обнаружено.
            Попробуйте сбросить параметры фильтрации.
          </p>
          <button
            type="button"
            className={styles.emptyActionBtn}
            onClick={resetFilters}
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <>
          <div className={styles.viewControlsRow}>
            <span className={styles.countLabel}>
              Найдено мероприятий: {total}
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
              events={events}
              cities={cities}
              categories={categories}
              onOpenDetail={openDetail}
              onOpenPhotos={openPhotosModal}
            />
          ) : (
            <div className={styles.cardsGrid}>
              {events.map((event) => (
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

          {/* Server-side Pagination */}
          <div className={styles.paginationRow}>
            <span className={styles.paginationTotal}>
              Всего: {total} {total === 1 ? 'мероприятие' : 'мероприятий'}
            </span>

            <div className={styles.paginationControls}>
              <button
                type="button"
                className={styles.paginationBtn}
                onClick={() => setPage(page - 1)}
                disabled={page <= 1 || isLoading}
                aria-label="Предыдущая страница"
              >
                <ChevronLeft size={16} aria-hidden="true" />
                <span>Предыдущая</span>
              </button>

              <span className={styles.paginationCurrent}>
                {page} из {totalPages}
              </span>

              <button
                type="button"
                className={styles.paginationBtn}
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages || isLoading}
                aria-label="Следующая страница"
              >
                <span>Следующая</span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Event Details Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isDetailOpen}
        isLoading={isLoadingDetail}
        cities={cities}
        categories={categories}
        onClose={closeDetail}
        onOpenPhotos={openPhotosModal}
      />

      {/* Event Photos Modal */}
      <EventPhotosModal
        key={selectedEvent ? `photos-${selectedEvent.id}-${isPhotosModalOpen}` : 'photos-none'}
        event={selectedEvent}
        isOpen={isPhotosModalOpen}
        isMutating={isMutatingPhoto}
        error={photosError}
        onClose={closePhotosModal}
        onUpload={uploadPhoto}
        onDelete={deletePhoto}
      />
    </div>
  )
}
