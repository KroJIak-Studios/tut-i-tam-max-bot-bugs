import React, { useRef, useState, useEffect, useCallback } from 'react'
import type { MapFilterState } from '../../types'
import { IconFilter } from '../Icons'
import styles from './MapFilterChips.module.css'

interface MapFilterChipsProps {
  filters: MapFilterState
  activeFilterCount: number
  onToggleQuickChip: (chip: MapFilterState['quickChip']) => void
  onOpenFilterSheet: () => void
}

const QUICK_CHIPS: Array<{ id: MapFilterState['quickChip']; label: string }> = [
  { id: 'today', label: 'Сегодня' },
  { id: 'free', label: 'Бесплатно' },
  { id: 'pushkin', label: 'Пушкинская' },
  { id: 'volunteer', label: 'Волонтёрство' },
]

export const MapFilterChips: React.FC<MapFilterChipsProps> = ({
  filters,
  activeFilterCount,
  onToggleQuickChip,
  onOpenFilterSheet,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 2)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return

    const resizeObserver = new ResizeObserver(() => updateScrollState())
    resizeObserver.observe(el)

    return () => {
      resizeObserver.disconnect()
    }
  }, [updateScrollState])

  return (
    <div className={styles.barContainer} role="toolbar" aria-label="Фильтры карты">
      {/* 1. Левая фиксированная кнопка «Фильтры» */}
      <button
        type="button"
        className={`${styles.filterBtn} ${activeFilterCount > 0 ? styles.filterBtnWithActive : ''}`}
        onClick={onOpenFilterSheet}
        aria-label={
          activeFilterCount > 0
            ? `Открыть фильтры (активно: ${activeFilterCount})`
            : 'Открыть фильтры'
        }
      >
        <span className={styles.filterBtnIcon}>
          <IconFilter size={15} color="currentColor" />
        </span>
        <span className={styles.filterBtnText}>Фильтры</span>
        {activeFilterCount > 0 && (
          <span className={styles.filterBadge}>{activeFilterCount}</span>
        )}
      </button>

      {/* 2. Правая скроллируемая область с быстрыми чипами */}
      <div
        className={`${styles.scrollAreaWrapper} ${canScrollLeft ? styles.hasScrollLeft : ''} ${canScrollRight ? styles.hasScrollRight : ''}`}
      >
        <div
          ref={scrollRef}
          className={styles.scrollTrack}
          onScroll={updateScrollState}
        >
          {QUICK_CHIPS.map((chip) => {
            const isSelected = filters.quickChip === chip.id
            return (
              <button
                key={chip.id}
                type="button"
                className={`${styles.quickChip} ${isSelected ? styles.quickChipActive : ''}`}
                onClick={() => onToggleQuickChip(chip.id)}
              >
                <span>{chip.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
