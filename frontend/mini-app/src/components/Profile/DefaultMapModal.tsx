import React, { useEffect } from 'react'
import type { MapProvider } from '../../types'
import { IconClose } from '../Icons'
import styles from './DefaultMapModal.module.css'

interface DefaultMapModalProps {
  currentProvider: MapProvider
  onClose: () => void
  onSelect: (provider: MapProvider) => void
}

const MAP_OPTIONS: Array<{ id: MapProvider; label: string }> = [
  { id: 'yandex', label: 'Яндекс Карты' },
  { id: '2gis', label: '2ГИС' },
  { id: 'system', label: 'Системные карты' },
]

export const DefaultMapModal: React.FC<DefaultMapModalProps> = ({
  currentProvider,
  onClose,
  onSelect,
}) => {
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

  const handleChoose = (provider: MapProvider) => {
    onSelect(provider)
    onClose()
  }

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Карты по умолчанию"
    >
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>Карты по умолчанию</h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Закрыть"
          >
            <IconClose size={18} color="currentColor" />
          </button>
        </div>

        <div className={styles.subtitle}>
          Выберите приложение для построения маршрутов и навигации:
        </div>

        <div className={styles.optionsList} role="radiogroup" aria-label="Картографические сервисы">
          {MAP_OPTIONS.map((opt) => {
            const isSelected = opt.id === currentProvider
            return (
              <div
                key={opt.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className={`${styles.optionItem} ${isSelected ? styles.optionItemSelected : ''}`}
                onClick={() => handleChoose(opt.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleChoose(opt.id)
                  }
                }}
              >
                <span className={styles.optionLabel}>{opt.label}</span>
                <div className={styles.radioCircle}>
                  {isSelected && <div className={styles.radioDot} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
