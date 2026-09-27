import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './CreateEventExitConfirmModal.module.css'

interface CreateEventExitConfirmModalProps {
  isOpen: boolean
  onStay: () => void
  onLeave: () => void
}

export const CreateEventExitConfirmModal: React.FC<CreateEventExitConfirmModalProps> = ({
  isOpen,
  onStay,
  onLeave,
}) => {
  const { t } = useTranslation()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onStay()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onStay])

  if (!isOpen) return null

  return (
    <div
      className={styles.overlay}
      onClick={onStay}
      role="dialog"
      aria-modal="true"
      aria-label={t('createEvent.exitConfirm.title')}
    >
      <div
        className={styles.modalSheet}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dragPill} />
        <h3 className={styles.title}>{t('createEvent.exitConfirm.title')}</h3>
        <p className={styles.description}>
          {t('createEvent.exitConfirm.description')}
        </p>

        <div className={styles.buttonsRow}>
          <button
            type="button"
            className={styles.stayBtn}
            onClick={onStay}
          >
            {t('createEvent.exitConfirm.stay')}
          </button>
          <button
            type="button"
            className={styles.leaveBtn}
            onClick={onLeave}
          >
            {t('createEvent.exitConfirm.leave')}
          </button>
        </div>
      </div>
    </div>
  )
}
