import React from 'react'
import { AlertCircle, Layers, RefreshCw } from 'lucide-react'
import { LocalizedEntityList } from '../components/LocalizedEntity/LocalizedEntityList'
import {
  CategoryDeleteModal,
  CategoryFormModal,
  CategoryToast,
  useCategories,
} from '../features/categories'
import type { EventCategory } from '../features/categories/types'
import styles from '../features/categories/components/CategoriesView.module.css'

export const CategoriesPage: React.FC = () => {
  const {
    categories,
    locales,
    fallbackLocale,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    loadData,
    isFormOpen,
    isDeleteOpen,
    activeCategory,
    openCreateModal,
    openEditModal,
    closeFormModal,
    openDeleteModal,
    closeDeleteModal,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    toast,
    dismissToast,
  } = useCategories()

  return (
    <div className={styles.container}>
      {/* Page header */}
      <header className={styles.pageHeader}>
        <div className={styles.pageTitleGroup}>
          <h1 className={styles.pageTitle}>
            <Layers size={22} className={styles.titleIcon} />
            <span>Категории мероприятий</span>
          </h1>
          <p className={styles.pageDescription}>
            Справочник категорий с мультиязычными названиями
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshBtn}
          onClick={loadData}
          disabled={isLoading}
          title="Обновить список"
          aria-label="Обновить список категорий"
        >
          <RefreshCw
            size={16}
            className={isLoading ? styles.spinning : undefined}
          />
        </button>
      </header>

      {/* Loading state */}
      {isLoading && (
        <div className={styles.stateBox} role="status">
          <div className={styles.spinner} />
          <p className={styles.stateTitle}>Загрузка категорий...</p>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className={styles.stateBox} role="alert">
          <AlertCircle size={36} className={styles.errorIcon} />
          <h2 className={styles.stateTitle}>Не удалось загрузить категории</h2>
          <p className={styles.stateText}>{error}</p>
          <button type="button" className={styles.retryBtn} onClick={loadData}>
            <RefreshCw size={16} />
            <span>Повторить попытку</span>
          </button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <LocalizedEntityList<EventCategory>
          items={categories}
          locales={locales}
          fallbackLocaleCode={fallbackLocale}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onCreateClick={openCreateModal}
          entityLabel="Категория"
          createButtonLabel="Добавить категорию"
          emptyTitle="Категории ещё не созданы"
          emptyText="В справочнике пока нет категорий мероприятий. Добавьте первую категорию с названиями на нужных языках."
          /* events_count not yet available in backend — omit countLabel */
        />
      )}

      {/* Modals */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        onSubmit={activeCategory ? handleUpdateCategory : handleCreateCategory}
        category={activeCategory}
        locales={locales}
        fallbackLocale={fallbackLocale}
      />

      <CategoryDeleteModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteCategory}
        category={activeCategory}
        fallbackLocale={fallbackLocale}
      />

      <CategoryToast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
