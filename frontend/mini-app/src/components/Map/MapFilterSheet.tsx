import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { MapFilterState } from '../../types'
import type { EventCategoryRecord } from '../../services/eventCategoryService'
import { getEventCategoryName } from '../../services/eventCategoryService'
import { FALLBACK_LOCALE } from '../../i18n'
import { IconClose } from '../Icons'
import styles from './MapFilterSheet.module.css'

interface MapFilterSheetProps {
  filters: MapFilterState
  categories: EventCategoryRecord[]
  onClose: () => void
  onApply: (newFilters: MapFilterState) => void
  onReset: () => void
}

const SOURCE_KEYS = [
  { id: 'all', key: 'all' },
  { id: 'external', key: 'external' },
  { id: 'user', key: 'user' },
] as const

export const MapFilterSheet: React.FC<MapFilterSheetProps> = ({
  filters,
  categories,
  onClose,
  onApply,
  onReset,
}) => {
  const { t, i18n } = useTranslation()
  const [draft, setDraft] = useState<MapFilterState>(filters)

  // Закрытие по нажатию клавиши Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const handleApply = () => {
    onApply(draft)
    onClose()
  }

  const handleReset = () => {
    onReset()
    onClose()
  }

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>{t('filters.title')}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t('common.close')}>
            <IconClose size={20} color="currentColor" />
          </button>
        </div>

        <div className={styles.contentScroll}>
          {/* Категория */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>{t('filters.categoriesTitle')}</div>
            <div className={styles.chipGroup}>
              <button type="button" className={`${styles.filterOptionChip} ${draft.category === 'all' ? styles.filterOptionChipSelected : ''}`} onClick={() => setDraft({ ...draft, category: 'all' })}>{t('filters.categories.all')}</button>
              {categories.map((category) => (
                <button key={category.id} type="button" className={`${styles.filterOptionChip} ${draft.category === category.id ? styles.filterOptionChipSelected : ''}`} onClick={() => setDraft({ ...draft, category: category.id })}>
                  {getEventCategoryName(category, i18n.language, FALLBACK_LOCALE)}
                </button>
              ))}
            </div>
          </div>

          {/* Источник */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>{t('filters.sourceTitle')}</div>
            <div className={styles.chipGroup}>
              {SOURCE_KEYS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.filterOptionChip} ${draft.source === s.id ? styles.filterOptionChipSelected : ''}`}
                  onClick={() => setDraft({ ...draft, source: s.id as MapFilterState['source'] })}
                >
                  {t(`filters.sources.${s.key}`)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>{t('filters.featuresTitle')}</div>
            <div className={styles.chipGroup} role="group" aria-label={t('filters.featuresTitle')}>
              <button type="button" className={`${styles.filterOptionChip} ${!draft.isFreeOnly && !draft.pushkinCardOnly ? styles.filterOptionChipSelected : ''}`} onClick={() => setDraft({ ...draft, isFreeOnly: false, pushkinCardOnly: false, quickChip: 'all' })}>{t('filters.priceAll')}</button>
              <button type="button" className={`${styles.filterOptionChip} ${draft.isFreeOnly ? styles.filterOptionChipSelected : ''}`} onClick={() => setDraft({ ...draft, isFreeOnly: true, pushkinCardOnly: false, quickChip: 'free' })}>{t('filters.freeOnly')}</button>
              <button type="button" className={`${styles.filterOptionChip} ${draft.pushkinCardOnly ? styles.filterOptionChipSelected : ''}`} onClick={() => setDraft({ ...draft, isFreeOnly: false, pushkinCardOnly: true, quickChip: 'pushkin' })}>{t('filters.pushkinCardOnly')}</button>
            </div>
          </div>
        </div>

        <div className={styles.actionsRow}>
          <button type="button" className={styles.resetBtn} onClick={handleReset}>
            {t('common.reset')}
          </button>
          <button type="button" className={styles.applyBtn} onClick={handleApply}>
            {t('filters.apply')}
          </button>
        </div>
      </div>
    </div>
  )
}

