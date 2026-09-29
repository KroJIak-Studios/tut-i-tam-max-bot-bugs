import React from 'react'
import { Plus, Search, X } from 'lucide-react'
import styles from './CategoriesHeader.module.css'

export interface CategoriesHeaderProps {
  totalCount: number
  filteredCount: number
  searchQuery: string
  onSearchChange: (value: string) => void
  onCreateClick: () => void
}

export const CategoriesHeader: React.FC<CategoriesHeaderProps> = ({
  totalCount,
  filteredCount,
  searchQuery,
  onSearchChange,
  onCreateClick,
}) => {
  return (
    <div className={styles.headerRoot}>
      <div className={styles.titleRow}>
        <div className={styles.titleCol}>
          <h1 className={styles.title}>Категории мероприятий</h1>
          <p className={styles.subtitle}>
            Справочник категорий событий с мультиязычными названиями
          </p>
        </div>

        <button
          type="button"
          className={styles.createBtn}
          onClick={onCreateClick}
        >
          <Plus size={18} />
          <span>Создать категорию</span>
        </button>
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Поиск по названию или языку..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Поиск категорий"
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => onSearchChange('')}
              aria-label="Очистить поиск"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className={styles.countBadge}>
          {searchQuery
            ? `Найдено: ${filteredCount} из ${totalCount}`
            : `Всего категорий: ${totalCount}`}
        </div>
      </div>
    </div>
  )
}
