import React, { useState } from 'react'
import type { MapFilterState } from '../../types'
import { IconClose } from '../Icons'
import styles from './MapFilterSheet.module.css'

interface MapFilterSheetProps {
  filters: MapFilterState
  onClose: () => void
  onApply: (newFilters: MapFilterState) => void
  onReset: () => void
}

export const MapFilterSheet: React.FC<MapFilterSheetProps> = ({
  filters,
  onClose,
  onApply,
  onReset,
}) => {
  const [draft, setDraft] = useState<MapFilterState>(filters)

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
        <div className={styles.handleBar} />

        <div className={styles.headerRow}>
          <h2 className={styles.title}>Фильтры</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            <IconClose size={20} color="currentColor" />
          </button>
        </div>

        <div className={styles.contentScroll}>
          {/* Категория */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Категория</div>
            <div className={styles.chipGroup}>
              {[
                { id: 'all', label: 'Все' },
                { id: 'events', label: 'Мероприятия' },
                { id: 'places', label: 'Места' },
                { id: 'parks', label: 'Парки' },
                { id: 'sports', label: 'Спорт' },
                { id: 'volunteer', label: 'Волонтёрство' },
                { id: 'user', label: 'Пользовательские' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.filterOptionChip} ${draft.category === c.id ? styles.filterOptionChipSelected : ''}`}
                  onClick={() => setDraft({ ...draft, category: c.id })}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Источник */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Источник</div>
            <div className={styles.chipGroup}>
              {[
                { id: 'all', label: 'Все метки' },
                { id: 'external', label: 'Городские события' },
                { id: 'user', label: 'От жителей' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.filterOptionChip} ${draft.source === s.id ? styles.filterOptionChipSelected : ''}`}
                  onClick={() => setDraft({ ...draft, source: s.id as MapFilterState['source'] })}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Дополнительные параметры */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Особенности</div>
            
            <label className={styles.toggleRow}>
              <span>Только бесплатные</span>
              <input
                type="checkbox"
                checked={draft.isFreeOnly}
                onChange={(e) => setDraft({ ...draft, isFreeOnly: e.target.checked })}
                className={styles.checkboxInput}
              />
            </label>

            <label className={styles.toggleRow}>
              <span>Пушкинская карта</span>
              <input
                type="checkbox"
                checked={draft.pushkinCardOnly}
                onChange={(e) => setDraft({ ...draft, pushkinCardOnly: e.target.checked })}
                className={styles.checkboxInput}
              />
            </label>

            <label className={styles.toggleRow}>
              <span>Только волонтёрские</span>
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
              Максимальная цена: {draft.maxPrice ? `${draft.maxPrice} ₽` : 'Любая'}
            </div>
            <div className={styles.chipGroup}>
              {[
                { val: null, label: 'Любая' },
                { val: 0, label: '0 ₽' },
                { val: 500, label: 'до 500 ₽' },
                { val: 1000, label: 'до 1000 ₽' },
              ].map((p, idx) => (
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
            Сбросить
          </button>
          <button type="button" className={styles.applyBtn} onClick={handleApply}>
            Показать
          </button>
        </div>
      </div>
    </div>
  )
}
