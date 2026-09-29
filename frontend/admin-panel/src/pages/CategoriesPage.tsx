import React from 'react'
import { AlertCircle, Layers, Plus, RefreshCw, Search } from 'lucide-react'
import {
  CategoriesHeader,
  CategoryCardList,
  CategoryDeleteModal,
  CategoryFormModal,
  CategoryTable,
  CategoryToast,
  useCategories,
} from '../features/categories'
import styles from '../features/categories/components/CategoriesView.module.css'

export const CategoriesPage: React.FC = () => {
  const {
    categories,
    filteredCategories,
    locales,
    fallbackLocale,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    loadData,
    // Modals
    isFormOpen,
    isDeleteOpen,
    activeCategory,
    openCreateModal,
    openEditModal,
    closeFormModal,
    openDeleteModal,
    closeDeleteModal,
    // CRUD operations
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    // Feedback
    toast,
    dismissToast,
  } = useCategories()

  return (
    <div className={styles.container}>
      <CategoriesHeader
        totalCount={categories.length}
        filteredCount={filteredCategories.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateClick={openCreateModal}
      />

      {/* Loading state */}
      {isLoading && (
        <div className={styles.stateBox} role="status">
          <div className={styles.spinner} />
          <p className={styles.stateTitle}>Загрузка категорий мероприятий...</p>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className={styles.stateBox} role="alert">
          <AlertCircle size={36} className={styles.errorIcon} />
          <h2 className={styles.stateTitle}>Не удалось загрузить категории</h2>
          <p className={styles.stateText}>{error}</p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={loadData}
          >
            <RefreshCw size={16} />
            <span>Повторить попытку</span>
          </button>
        </div>
      )}

      {/* Empty state (No categories at all) */}
      {!isLoading && !error && categories.length === 0 && (
        <div className={styles.stateBox}>
          <Layers size={40} className={styles.emptyIcon} />
          <h2 className={styles.stateTitle}>Категории ещё не созданы</h2>
          <p className={styles.stateText}>
            В справочнике пока нет категорий мероприятий. Добавьте первую категорию с названиями на нужных языках.
          </p>
          <button
            type="button"
            className={styles.createFirstBtn}
            onClick={openCreateModal}
          >
            <Plus size={18} />
            <span>Создать первую категорию</span>
          </button>
        </div>
      )}

      {/* Empty search results */}
      {!isLoading && !error && categories.length > 0 && filteredCategories.length === 0 && (
        <div className={styles.stateBox}>
          <Search size={36} className={styles.emptyIcon} />
          <h2 className={styles.stateTitle}>Ничего не найдено</h2>
          <p className={styles.stateText}>
            По запросу «{searchQuery}» не найдено ни одной категории. Попробуйте изменить формулировку или сбросить фильтр.
          </p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => setSearchQuery('')}
          >
            Сбросить поиск
          </button>
        </div>
      )}

      {/* Categories Content (Desktop Table + Mobile Cards) */}
      {!isLoading && !error && filteredCategories.length > 0 && (
        <>
          <CategoryTable
            categories={filteredCategories}
            locales={locales}
            fallbackLocale={fallbackLocale}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
          <CategoryCardList
            categories={filteredCategories}
            locales={locales}
            fallbackLocale={fallbackLocale}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        </>
      )}

      {/* Create / Edit Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        onSubmit={activeCategory ? handleUpdateCategory : handleCreateCategory}
        category={activeCategory}
        locales={locales}
        fallbackLocale={fallbackLocale}
      />

      {/* Delete Confirmation Modal */}
      <CategoryDeleteModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteCategory}
        category={activeCategory}
        fallbackLocale={fallbackLocale}
      />

      {/* Toast feedback */}
      <CategoryToast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
