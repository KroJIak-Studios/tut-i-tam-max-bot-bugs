import React from 'react'
import { IconFilter } from '../Icons'
import styles from './MapFilterChips.module.css'

interface MapFilterChipsProps {
  isTodayActive: boolean
  isFreeOnly: boolean
  extraFilterCount: number
  onToggleToday: () => void
  onToggleFree: () => void
  onOpenFilterSheet: () => void
}

export const MapFilterChips: React.FC<MapFilterChipsProps> = ({
  isTodayActive,
  isFreeOnly,
  extraFilterCount,
  onToggleToday,
  onToggleFree,
  onOpenFilterSheet,
}) => {
  return (
    <div className={styles.barContainer} role="toolbar" aria-label="Фильтры карты">
      {/* 1. Кнопка «Фильтры» с бейджем активных дополнительных фильтров */}
      <button
        type="button"
        className={`${styles.filterBtn} ${extraFilterCount > 0 ? styles.filterBtnWithActive : ''}`}
        onClick={onOpenFilterSheet}
        aria-label={
          extraFilterCount > 0
            ? `Открыть фильтры (дополнительно: ${extraFilterCount})`
            : 'Открыть фильтры'
        }
      >
        <span className={styles.filterBtnIcon}>
          <IconFilter size={15} color="currentColor" />
        </span>
        <span className={styles.filterBtnText}>Фильтры</span>
        {extraFilterCount > 0 && (
          <span className={styles.filterBadge}>{extraFilterCount}</span>
        )}
      </button>

      {/* 2. Быстрый фильтр «Сегодня» */}
      <button
        type="button"
        className={`${styles.quickChip} ${isTodayActive ? styles.quickChipActive : ''}`}
        onClick={onToggleToday}
        aria-pressed={isTodayActive}
      >
        <span>Сегодня</span>
      </button>

      {/* 3. Быстрый фильтр «Бесплатно» */}
      <button
        type="button"
        className={`${styles.quickChip} ${isFreeOnly ? styles.quickChipActive : ''}`}
        onClick={onToggleFree}
        aria-pressed={isFreeOnly}
      >
        <span>Бесплатно</span>
      </button>
    </div>
  )
}
