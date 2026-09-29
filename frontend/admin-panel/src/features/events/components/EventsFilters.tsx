import React from 'react'
import { Search, X, RotateCcw } from 'lucide-react'
import { resolveCityName, resolveCategoryName } from '../utils/eventFormatters'
import type { City } from '../../cities/types/city'
import type { EventCategory } from '../../categories/types'
import type { EventFiltersState } from '../types'
import styles from './EventsFilters.module.css'

interface EventsFiltersProps {
  filters: EventFiltersState
  cities: City[]
  categories: EventCategory[]
  onUpdateFilters: (updates: Partial<EventFiltersState>) => void
  onResetFilters: () => void
}

export const EventsFilters: React.FC<EventsFiltersProps> = ({
  filters,
  cities,
  categories,
  onUpdateFilters,
  onResetFilters,
}) => {
  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.cityId !== 'all' ||
    filters.categoryId !== 'all' ||
    filters.source !== 'all' ||
    filters.visible !== 'all' ||
    filters.freeOnly ||
    filters.pushkinOnly

  return (
    <div className={styles.filtersContainer} role="search" aria-label="Фильтры мероприятий">
      <div className={styles.searchRow}>
        <Search size={18} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Поиск по названию, адресу или описанию..."
          value={filters.search}
          onChange={(e) => onUpdateFilters({ search: e.target.value })}
          aria-label="Поиск по мероприятиям"
        />
        {filters.search && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => onUpdateFilters({ search: '' })}
            aria-label="Очистить поиск"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className={styles.selectorsRow}>
        <div className={styles.filterGroup}>
          <label htmlFor="filter-city" className={styles.filterLabel}>
            Город
          </label>
          <select
            id="filter-city"
            className={styles.selectInput}
            value={filters.cityId}
            onChange={(e) =>
              onUpdateFilters({
                cityId: e.target.value === 'all' ? 'all' : Number(e.target.value),
              })
            }
          >
            <option value="all">Все города</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {resolveCityName(city.id, cities)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-category" className={styles.filterLabel}>
            Категория
          </label>
          <select
            id="filter-category"
            className={styles.selectInput}
            value={filters.categoryId}
            onChange={(e) =>
              onUpdateFilters({
                categoryId: e.target.value === 'all' ? 'all' : Number(e.target.value),
              })
            }
          >
            <option value="all">Все категории</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {resolveCategoryName(cat.id, categories)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-source" className={styles.filterLabel}>
            Происхождение
          </label>
          <select
            id="filter-source"
            className={styles.selectInput}
            value={filters.source}
            onChange={(e) =>
              onUpdateFilters({
                source: e.target.value as 'all' | 'official' | 'user',
              })
            }
          >
            <option value="all">Все типы</option>
            <option value="official">Официальные события</option>
            <option value="user">Пользовательские события</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-visible" className={styles.filterLabel}>
            Видимость в каталоге
          </label>
          <select
            id="filter-visible"
            className={styles.selectInput}
            value={filters.visible}
            onChange={(e) =>
              onUpdateFilters({
                visible: e.target.value as 'all' | 'visible' | 'hidden',
              })
            }
          >
            <option value="all">Все (видимые и скрытые)</option>
            <option value="visible">Только видимые</option>
            <option value="hidden">Только скрытые</option>
          </select>
        </div>

        <label className={styles.checkboxContainer}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={filters.freeOnly}
            onChange={(e) => onUpdateFilters({ freeOnly: e.target.checked })}
          />
          <span>Бесплатные</span>
        </label>

        <label className={styles.checkboxContainer}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={filters.pushkinOnly}
            onChange={(e) => onUpdateFilters({ pushkinOnly: e.target.checked })}
          />
          <span>Пушкинская карта</span>
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={onResetFilters}
            aria-label="Сбросить все фильтры"
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>Сбросить</span>
          </button>
        )}
      </div>
    </div>
  )
}
