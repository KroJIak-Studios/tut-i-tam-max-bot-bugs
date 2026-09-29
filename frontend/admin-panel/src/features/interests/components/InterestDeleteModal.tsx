import React, { useEffect, useId, useState } from 'react'
import { AlertCircle, Trash2 } from 'lucide-react'
import { getPrimaryName } from '../utils/localeUtils'
import type { InterestItem } from '../types'
import styles from './InterestDeleteModal.module.css'

export interface InterestDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (interestId: number) => Promise<void>
  interest: InterestItem | null
  fallbackLocaleCode: string
}

const InterestDeleteModalContent: React.FC<{
  onClose: () => void
  onConfirm: (interestId: number) => Promise<void>
  interest: InterestItem
  fallbackLocaleCode: string
}> = ({ onClose, onConfirm, interest, fallbackLocaleCode }) => {
  const titleId = useId()
  const descId = useId()
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDeleting, onClose])

  const displayName =
    getPrimaryName(interest, fallbackLocaleCode) || `Интерес #${interest.id}`

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await onConfirm(interest.id)
      onClose()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Не удалось удалить интерес'
      setDeleteError(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose()
        }
      }}
    >
      <div
        className={styles.modal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Trash2 size={20} />
          </div>
          <h2 id={titleId} className={styles.title}>
            Удаление интереса
          </h2>
        </div>

        <div className={styles.body}>
          <p id={descId} className={styles.description}>
            Вы действительно хотите удалить интерес{' '}
            <span className={styles.targetHighlight}>«{displayName}»</span>?
          </p>

          <div className={styles.warningBox}>
            <AlertCircle size={16} />
            <span>
              Действие необратимо. Интерес будет удалён из справочника.
            </span>
          </div>

          {deleteError && (
            <div className={styles.errorBox} role="alert">
              <AlertCircle size={16} />
              <span>{deleteError}</span>
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isDeleting}
            >
              Отмена
            </button>
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={handleDelete}
              disabled={isDeleting}
              autoFocus
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const InterestDeleteModal: React.FC<InterestDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  interest,
  fallbackLocaleCode,
}) => {
  if (!isOpen || !interest) return null

  return (
    <InterestDeleteModalContent
      onClose={onClose}
      onConfirm={onConfirm}
      interest={interest}
      fallbackLocaleCode={fallbackLocaleCode}
    />
  )
}
