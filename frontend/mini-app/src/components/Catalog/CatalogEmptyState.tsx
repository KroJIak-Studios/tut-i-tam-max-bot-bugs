import React from 'react'
import { IconFilter } from '../Icons'
import styles from './CatalogEmptyState.module.css'

interface CatalogEmptyStateProps {
  onResetFilters: () => void
  onShowToday: () => void
  hasActiveFilters: boolean
}

export const CatalogEmptyState: React.FC<CatalogEmptyStateProps> = ({
  onResetFilters,
  onShowToday,
  hasActiveFilters,
}) => {
  return (
    <div className={styles.emptyContainer} role="status">
      <div className={styles.iconCircle} aria-hidden="true">
        <IconFilter size={24} color="#6B7280" />
      </div>

      <h3 className={styles.title}>Ничего не найдено</h3>
      <p className={styles.description}>
        Попробуйте изменить дату или сбросить активные фильтры
      </p>

      <div className={styles.actions}>
        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={onResetFilters}
          >
            Сбросить фильтры
          </button>
        )}
        <button
          type="button"
          className={styles.todayBtn}
          onClick={onShowToday}
        >
          Показать сегодня
        </button>
      </div>
    </div>
  )
}
