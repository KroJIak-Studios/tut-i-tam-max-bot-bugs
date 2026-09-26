import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { IconClose, IconCheck } from '../Icons'
import { AVAILABLE_INTERESTS } from '../../context/userPreferencesDef'
import styles from './InterestsModal.module.css'

interface InterestsModalProps {
  currentInterests: string[]
  onClose: () => void
  onSave: (interests: string[]) => void
}

export const InterestsModal: React.FC<InterestsModalProps> = ({
  currentInterests,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<string[]>(currentInterests)

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

  const toggleInterest = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const handleSave = () => {
    onSave(selected)
    onClose()
  }

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('profile.interests')}
    >
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{t('profile.interests')}</h3>
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
          {t('profile.chooseInterestsSubtitle')}
        </div>

        <div className={styles.interestsGrid} role="group" aria-label={t('profile.interests')}>
          {AVAILABLE_INTERESTS.map((interest) => {
            const isSelected = selected.includes(interest)
            return (
              <button
                key={interest}
                type="button"
                className={`${styles.interestChip} ${isSelected ? styles.interestChipSelected : ''}`}
                onClick={() => toggleInterest(interest)}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <span className={styles.checkIcon}>
                    <IconCheck size={14} color="#FFFFFF" />
                  </span>
                )}
                <span>{interest}</span>
              </button>
            )
          })}
        </div>

        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
          >
            {t('common.save')} ({selected.length})
          </button>
        </div>
      </div>
    </div>
  )
}
