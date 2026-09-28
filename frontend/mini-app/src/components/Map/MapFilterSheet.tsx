import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { MapFilterState } from '../../types'
import { IconClose } from '../Icons'
import styles from './MapFilterSheet.module.css'

interface MapFilterSheetProps {
  filters: MapFilterState
  onClose: () => void
  onApply: (newFilters: MapFilterState) => void
  onReset: () => void
}

const CATEGORY_KEYS = [
  { id: 'all', key: 'all' },
  { id: 'events', key: 'events' },
  { id: 'places', key: 'places' },
  { id: 'parks', key: 'parks' },
  { id: 'sports', key: 'sports' },
  { id: 'volunteer', key: 'volunteer' },
  { id: 'user', key: 'user' },
] as const

const SOURCE_KEYS = [
  { id: 'all', key: 'all' },
  { id: 'external', key: 'external' },
  { id: 'user', key: 'user' },
] as const

export const MapFilterSheet: React.FC<MapFilterSheetProps> = ({
  filters,
  onClose,
  onApply,
  onReset,
}) => {
  const { t } = useTranslation()
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

  const priceLabel =
    draft.maxPrice !== null && draft.maxPrice !== undefined
      ? `${draft.maxPrice} ₽`
      : t('filters.prices.any')

  const priceOptions = [
    { val: null, label: t('filters.prices.any') },
    { val: 0, label: '0 ₽' },
    { val: 500, label: t('filters.prices.upTo', { price: '500 ₽' }) },
    { val: 1000, label: t('filters.prices.upTo', { price: '1000 ₽' }) },
  ]

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
              {CATEGORY_KEYS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.filterOptionChip} ${draft.category === c.id ? styles.filterOptionChipSelected : ''}`}
                  onClick={() => setDraft({ ...draft, category: c.id })}
                >
                  {t(`filters.categories.${c.key}`)}
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

          {/* Дополнительные параметры */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>{t('filters.featuresTitle')}</div>
            
            <label className={styles.toggleRow}>
              <span>{t('filters.freeOnly')}</span>
              <input
                type="checkbox"
                checked={draft.isFreeOnly}
                onChange={(e) => setDraft({ ...draft, isFreeOnly: e.target.checked })}
                className={styles.checkboxInput}
              />
            </label>

            <label className={styles.toggleRow}>
              <span>{t('filters.pushkinCardOnly')}</span>
              <input
                type="checkbox"
                checked={draft.pushkinCardOnly}
                onChange={(e) => setDraft({ ...draft, pushkinCardOnly: e.target.checked })}
                className={styles.checkboxInput}
              />
            </label>

            <label className={styles.toggleRow}>
              <span>{t('filters.volunteerOnly')}</span>
              <input
                type="checkbox"
                checked={draft.volunteerOnly}
                onChange={(e) => setDraft({ ...draft, volunteerOnly: e.target.checked })}
                className={styles.checkboxInput}
              />
            </label>
          </div>

          {/* Максимальная цена */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              {t('filters.maxPriceTitle', { price: priceLabel })}
            </div>
            <div className={styles.chipGroup}>
              {priceOptions.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.filterOptionChip} ${draft.maxPrice === p.val ? styles.filterOptionChipSelected : ''}`}
                  onClick={() => setDraft({ ...draft, maxPrice: p.val })}
                >
                  {p.label}
                </button>
              ))}
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

