import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { MapEvent } from '../../types'
import styles from './ConfirmRemoveModal.module.css'

interface ConfirmRemoveModalProps {
  event: MapEvent | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (event: MapEvent) => void
}

export const ConfirmRemoveModal: React.FC<ConfirmRemoveModalProps> = ({
  event,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !event) return null

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('plans.removeModal.title')}
    >
      <div
        className={styles.modalSheet}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dragPill} />
        <h3 className={styles.title}>{t('plans.removeModal.title')}</h3>
        <p className={styles.description}>
          {t('plans.removeModal.description', { title: event.title })}
        </p>

        <div className={styles.buttonsRow}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={() => {
              onConfirm(event)
              onClose()
            }}
          >
            {t('plans.removeModal.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
