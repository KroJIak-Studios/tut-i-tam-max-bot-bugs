import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { MapProvider } from '../../types'
import { IconClose } from '../Icons'
import styles from './DefaultMapModal.module.css'

interface DefaultMapModalProps {
  currentProvider: MapProvider
  onClose: () => void
  onSelect: (provider: MapProvider) => void
}

export const DefaultMapModal: React.FC<DefaultMapModalProps> = ({
  currentProvider,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation()

  const mapOptions: Array<{ id: MapProvider; label: string }> = [
    { id: 'yandex', label: t('profile.yandexMaps') },
    { id: '2gis', label: t('profile.gisMaps') },
    { id: 'system', label: t('profile.systemMaps') },
  ]

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
      aria-label={t('profile.defaultMaps')}
    >
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{t('profile.defaultMaps')}</h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <IconClose size={18} color="currentColor" />
          </button>
        </div>

        <div className={styles.subtitle}>
          {t('profile.defaultMapsSubtitle')}
        </div>

        <div className={styles.optionsList} role="radiogroup" aria-label={t('profile.defaultMaps')}>
          {mapOptions.map((opt) => {
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
