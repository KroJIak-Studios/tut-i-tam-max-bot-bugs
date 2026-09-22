import React, { useEffect } from 'react'
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
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.modalSheet}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dragPill} />
        <h3 className={styles.title}>Убрать из планов?</h3>
        <p className={styles.description}>
          Мероприятие «<strong>{event.title}</strong>» будет удалено из ваших запланированных событий.
        </p>

        <div className={styles.buttonsRow}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={() => {
              onConfirm(event)
              onClose()
            }}
          >
            Убрать
          </button>
        </div>
      </div>
    </div>
  )
}
