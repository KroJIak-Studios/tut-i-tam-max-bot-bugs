import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LOCALES, type SupportedLocaleCode } from '../../i18n'
import { IconClose } from '../Icons'
import styles from './LanguageModal.module.css'

interface LanguageModalProps {
  currentLocale: SupportedLocaleCode
  onClose: () => void
  onSelect: (locale: SupportedLocaleCode) => void
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  currentLocale,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation()

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

  const handleChoose = (locale: SupportedLocaleCode) => {
    onSelect(locale)
    onClose()
  }

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('profile.appLanguage')}
    >
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{t('profile.appLanguage')}</h3>
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
          {t('profile.languageModalSubtitle')}
        </div>

        <div
          className={styles.optionsList}
          role="radiogroup"
          aria-label={t('profile.appLanguage')}
        >
          {SUPPORTED_LOCALES.map((opt) => {
            const isSelected = opt.code === currentLocale
            return (
              <div
                key={opt.code}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className={`${styles.optionItem} ${isSelected ? styles.optionItemSelected : ''}`}
                onClick={() => handleChoose(opt.code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleChoose(opt.code)
                  }
                }}
              >
                <div className={styles.labelCol}>
                  <span className={styles.optionLabel}>{opt.nativeName}</span>
                  {opt.name !== opt.nativeName && (
                    <span className={styles.optionSub}>{opt.name}</span>
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
