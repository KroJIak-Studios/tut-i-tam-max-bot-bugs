import React from 'react'
import type { MapFilterState } from '../../types'
import { IconFilter } from '../Icons'
import styles from './MapFilterChips.module.css'

interface MapFilterChipsProps {
  filters: MapFilterState
  activeFilterCount: number
  onToggleQuickChip: (chip: MapFilterState['quickChip']) => void
  onOpenFilterSheet: () => void
}

export const MapFilterChips: React.FC<MapFilterChipsProps> = ({
  filters,
  activeFilterCount,
  onToggleQuickChip,
  onOpenFilterSheet,
}) => {
  return (
    <div className={styles.chipsWrapper} role="toolbar" aria-label="Быстрые фильтры карты">
      {/* 1. Кнопка «Фильтры» */}
      <button
        type="button"
        className={`${styles.chip} ${activeFilterCount > 0 ? styles.chipActive : ''}`}
        onClick={onOpenFilterSheet}
        aria-label="Открыть фильтры"
      >
        <IconFilter size={15} color="currentColor" />
        <span>Фильтры</span>
        {activeFilterCount > 0 && (
          <span className={styles.filterBadge}>{activeFilterCount}</span>
        )}
      </button>

      {/* 2. «Сегодня» */}
      <button
        type="button"
        className={`${styles.chip} ${filters.quickChip === 'today' ? styles.chipActive : ''}`}
        onClick={() => onToggleQuickChip('today')}
      >
        <span>Сегодня</span>
      </button>

      {/* 3. «Пушкинская» */}
      <button
        type="button"
        className={`${styles.chip} ${filters.quickChip === 'pushkin' ? styles.chipActive : ''}`}
        onClick={() => onToggleQuickChip('pushkin')}
      >
        <span>Пушкинская</span>
      </button>

      {/* 4. «До 500 ₽» */}
      <button
        type="button"
        className={`${styles.chip} ${filters.quickChip === 'under500' ? styles.chipActive : ''}`}
        onClick={() => onToggleQuickChip('under500')}
      >
        <span>До 500 ₽</span>
      </button>

      {/* 5. «Волонтёрство» */}
      <button
        type="button"
        className={`${styles.chip} ${filters.quickChip === 'volunteer' ? styles.chipActive : ''}`}
        onClick={() => onToggleQuickChip('volunteer')}
      >
        <span>Волонтёрство</span>
      </button>
    </div>
  )
}
