import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { AppMapProviderId } from '../../types'
import { getAvailableAppMapProviders } from '../../services/mapProviders'
import { IconClose } from '../Icons'
import styles from './AppMapModal.module.css'

interface AppMapModalProps {
  currentProvider: AppMapProviderId
  onClose: () => void
  onSelect: (provider: AppMapProviderId) => void
}

export const AppMapModal: React.FC<AppMapModalProps> = ({
  currentProvider,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation()
  const availableProviders = getAvailableAppMapProviders()

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

  const handleChoose = (providerId: AppMapProviderId) => {
    onSelect(providerId)
    onClose()
  }

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('profile.appMapModalTitle')}
    >
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{t('profile.appMapModalTitle')}</h3>
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
          {t('profile.appMapModalSubtitle')}
        </div>

        <div className={styles.optionsList} role="radiogroup" aria-label={t('profile.appMapModalTitle')}>
          {availableProviders.map((provider) => {
            const isSelected = provider.id === currentProvider
            const name = t(provider.nameKey)
            const description = provider.descriptionKey ? t(provider.descriptionKey) : ''

            return (
              <div
                key={provider.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className={`${styles.optionItem} ${isSelected ? styles.optionItemSelected : ''}`}
                onClick={() => handleChoose(provider.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleChoose(provider.id)
                  }
                }}
              >
                <div className={styles.optionTextCol}>
                  <span className={styles.optionLabel}>{name}</span>
                  {description && (
                    <span className={styles.optionDescription}>{description}</span>
                  )}
                </div>
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
