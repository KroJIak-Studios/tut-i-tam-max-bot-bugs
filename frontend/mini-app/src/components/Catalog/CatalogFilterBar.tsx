import React from 'react'
import { useTranslation } from 'react-i18next'
import { IconFilter, IconCalendar, IconChevronDown } from '../Icons'
import { formatChipDate, getIsoDate } from '../../utils/dateUtils'
import styles from './CatalogFilterBar.module.css'

interface CatalogFilterBarProps {
  selectedDate: string
  allDates: boolean
  isFreeOnly: boolean
  extraFilterCount: number
  onOpenDatePicker: () => void
  onToggleFree: () => void
  onOpenFilterSheet: () => void
}

export const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({
  selectedDate,
  allDates,
  isFreeOnly,
  extraFilterCount,
  onOpenDatePicker,
  onToggleFree,
  onOpenFilterSheet,
}) => {
  const { t, i18n } = useTranslation()
  const isToday = selectedDate === getIsoDate(0)
  const dateLabel = allDates ? t('catalog.allDates') : formatChipDate(selectedDate, i18n.language)

  return (
    <div className={styles.barContainer} role="toolbar" aria-label={t('catalog.filterToolbar')}>
      {/* 1. Кнопка «Фильтры» с бейджем активных дополнительных фильтров */}
      <button
        type="button"
        className={`${styles.filterBtn} ${extraFilterCount > 0 ? styles.filterBtnWithActive : ''}`}
        onClick={onOpenFilterSheet}
        aria-label={
          extraFilterCount > 0
            ? `${t('catalog.filters')} (${extraFilterCount})`
            : t('catalog.filters')
        }
      >
        <span className={styles.filterBtnIcon}>
          <IconFilter size={14} color="currentColor" />
        </span>
        <span className={styles.filterBtnText}>{t('catalog.filters')}</span>
        {extraFilterCount > 0 && (
          <span className={styles.filterBadge}>{extraFilterCount}</span>
        )}
      </button>

      {/* 2. Чип выбора даты («Сегодня», «Завтра», «24 сен.») */}
      <button
        type="button"
        className={`${styles.dateChip} ${!isToday ? styles.dateChipCustom : ''}`}
        onClick={onOpenDatePicker}
        aria-label={`${t('dates.selectDate')} (${dateLabel})`}
        aria-haspopup="dialog"
      >
        <span className={styles.dateChipIcon}>
          <IconCalendar size={14} color="currentColor" />
        </span>
        <span className={styles.dateChipText}>{dateLabel}</span>
        <span className={styles.dateChipChevron}>
          <IconChevronDown size={13} color="currentColor" />
        </span>
      </button>

      {/* 3. Быстрый фильтр «Бесплатно» */}
      <button
        type="button"
        className={`${styles.quickChip} ${isFreeOnly ? styles.quickChipActive : ''}`}
        onClick={onToggleFree}
        aria-pressed={isFreeOnly}
      >
        <span>{t('catalog.free')}</span>
      </button>
    </div>
  )
}
