import React from 'react'
import {
  Building2,
  Plus,
  Search,
  X,
  RotateCw,
  AlertCircle,
} from 'lucide-react'
import { useCities } from '../features/cities/hooks/useCities'
import { CityCard } from '../features/cities/components/CityCard'
import { CityFormModal } from '../features/cities/components/CityFormModal'
import { CityStatusBanner } from '../features/cities/components/CityStatusBanner'
import styles from './CitiesPage.module.css'

export const CitiesPage: React.FC = () => {
  const {
    cities,
    rawCitiesCount,
    locales,
    fallbackLocale,
    isLoading,
    error,
    isSaving,
    activeModal,
    searchQuery,
    setSearchQuery,
    loadData,
    openCreateModal,
    openEditModal,
    closeModal,
    handleCreateCity,
    handleUpdateCity,
  } = useCities()

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.titleArea}>
            <div className={styles.titleRow}>
              <h1 className={styles.pageTitle}>Города</h1>
              <span className={styles.counterBadge}>{rawCitiesCount}</span>
            </div>
            <p className={styles.pageSubtitle}>
              Справочник городов с мультиязычными названиями и географическими
              координатами центра
            </p>
          </div>

          <button
            type="button"
            className={styles.addBtn}
            onClick={openCreateModal}
            aria-label="Добавить новый город"
          >
            <Plus size={18} />
            <span>Добавить город</span>
          </button>
        </div>

        {/* Integration notice banner */}
        <CityStatusBanner />

        {/* Search & Refresh Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Поиск по названию или ID города..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Поиск городов"
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery('')}
                title="Очистить поиск"
                aria-label="Очистить поиск"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            type="button"
            className={styles.refreshBtn}
            onClick={loadData}
            disabled={isLoading}
            title="Обновить список городов"
            aria-label="Обновить список городов"
          >
            <RotateCw size={16} className={isLoading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className={styles.skeletonList}>
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>
      ) : error ? (
        <div className={styles.errorCard} role="alert">
          <div className={styles.errorIconWrapper}>
            <AlertCircle size={24} />
          </div>
          <h2 className={styles.errorTitle}>Не удалось загрузить города</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button type="button" className={styles.retryBtn} onClick={loadData}>
            <RotateCw size={15} />
            <span>Повторить попытку</span>
          </button>
        </div>
      ) : cities.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIconWrapper}>
            <Building2 size={26} />
          </div>
          <h2 className={styles.emptyTitle}>
            {searchQuery ? 'Города не найдены' : 'Список городов пуст'}
          </h2>
          <p className={styles.emptySubtitle}>
            {searchQuery
              ? `По запросу «${searchQuery}» ничего не найдено. Попробуйте изменить параметры поиска.`
              : 'Добавьте первый город в справочник, указав его основное название и точку на карте.'}
          </p>
          {searchQuery ? (
            <button
              type="button"
              className={styles.emptyBtn}
              onClick={() => setSearchQuery('')}
            >
              <span>Сбросить поиск</span>
            </button>
          ) : (
            <button
              type="button"
              className={styles.emptyBtn}
              onClick={openCreateModal}
            >
              <Plus size={15} />
              <span>Добавить первый город</span>
            </button>
          )}
        </div>
      ) : (
        <div className={styles.citiesList}>
          {cities.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              locales={locales}
              fallbackLocale={fallbackLocale}
              onEdit={openEditModal}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {activeModal && (
        <CityFormModal
          key={`${activeModal.mode}-${activeModal.city?.id || 'new'}`}
          isOpen={true}
          mode={activeModal.mode}
          initialCity={activeModal.city}
          locales={locales}
          fallbackLocale={fallbackLocale}
          onClose={closeModal}
          onSubmit={async (payload) => {
            if (activeModal.mode === 'create') {
              await handleCreateCity(payload)
            } else if (activeModal.city) {
              await handleUpdateCity(activeModal.city.id, payload)
            }
          }}
          isSubmitting={isSaving}
        />
      )}
    </div>
  )
}
