import React from 'react'
import { Search, X } from 'lucide-react'
import { AdminSelect } from '../../../components/AdminSelect'
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
}

export const EventsFilters: React.FC<EventsFiltersProps> = ({
  filters,
  cities,
  categories,
  onUpdateFilters,
}) => {
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
          <AdminSelect
            value={String(filters.cityId)}
            onChange={(value) => onUpdateFilters({ cityId: value === 'all' ? 'all' : Number(value) })}
            options={[{ value: 'all', label: 'Все города' }, ...cities.map((city) => ({ value: String(city.id), label: resolveCityName(city.id, cities) }))]}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-category" className={styles.filterLabel}>
            Категория
          </label>
          <AdminSelect
            value={String(filters.categoryId)}
            onChange={(value) => onUpdateFilters({ categoryId: value === 'all' ? 'all' : Number(value) })}
            options={[{ value: 'all', label: 'Все категории' }, ...categories.map((category) => ({ value: String(category.id), label: resolveCategoryName(category.id, categories) }))]}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-source" className={styles.filterLabel}>
            Происхождение
          </label>
          <AdminSelect
            value={filters.source}
            onChange={(value) => onUpdateFilters({ source: value as EventFiltersState['source'] })}
            options={[{ value: 'all', label: 'Все типы' }, { value: 'official', label: 'Официальные события' }, { value: 'user', label: 'Пользовательские события' }]}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-visible" className={styles.filterLabel}>
            Видимость в каталоге
          </label>
          <AdminSelect
            value={filters.visible}
            onChange={(value) => onUpdateFilters({ visible: value as EventFiltersState['visible'] })}
            options={[{ value: 'all', label: 'Все' }, { value: 'visible', label: 'Только видимые' }, { value: 'hidden', label: 'Только скрытые' }]}
          />
        </div>

        <div className={styles.toggleGroup} role="group" aria-label="Особенности">
          <button
            type="button"
            className={`${styles.toggle} ${filters.freeOnly ? styles.toggleActive : ''}`}
            aria-pressed={filters.freeOnly}
            onClick={() => onUpdateFilters({ freeOnly: !filters.freeOnly, pushkinOnly: filters.freeOnly ? filters.pushkinOnly : false })}
          >
            Бесплатные
          </button>
          <button
            type="button"
            className={`${styles.toggle} ${filters.pushkinOnly ? styles.toggleActive : ''}`}
            aria-pressed={filters.pushkinOnly}
            onClick={() => onUpdateFilters({ pushkinOnly: !filters.pushkinOnly, freeOnly: filters.pushkinOnly ? filters.freeOnly : false })}
          >
            Пушкинская карта
          </button>
        </div>
      </div>
    </div>
  )
}
