import React, { useState, useEffect } from 'react'
import type { AdminRequestStatus } from '../../types/request'
import { IconX, IconCheck, IconAlertCircle } from '../Icons'
import styles from './ModerationConfirmModal.module.css'

interface ModerationConfirmModalProps {
  targetStatus: AdminRequestStatus
  initialComment?: string
  isOpen: boolean
  onClose: () => void
  onConfirm: (comment: string) => void
}

export const ModerationConfirmModal: React.FC<ModerationConfirmModalProps> = ({
  targetStatus,
  initialComment = '',
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [comment, setComment] = useState(initialComment)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isReject = targetStatus === 'rejected'
  const isNeedsChanges = targetStatus === 'needs_changes'
  const isApprove = targetStatus === 'approved'

  const title = isApprove
    ? 'Одобрить мероприятие?'
    : isReject
      ? 'Отклонить заявку?'
      : 'Запросить уточнение у автора?'

  const description = isApprove
    ? 'После одобрения заявка перейдёт в статус «Одобрено» и будет готова для последующей публикации.'
    : isReject
      ? 'Укажите причину отклонения. Заявитель увидит это сообщение.'
      : 'Укажите, что именно необходимо исправить или дополнить в заявке.'

  const isCommentRequired = isReject || isNeedsChanges

  const handleConfirm = () => {
    if (isCommentRequired && !comment.trim()) {
      setError(
        isReject
          ? 'Пожалуйста, укажите причину отклонения'
          : 'Пожалуйста, укажите замечания для заявителя',
      )
      return
    }
    setError(null)
    onConfirm(comment.trim())
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 id="confirm-modal-title" className={styles.title}>
            {title}
          </h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Закрыть окно"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.description}>{description}</p>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="modal-comment">
              {isApprove
                ? 'Комментарий модератора (необязательно)'
                : isReject
                  ? 'Причина отклонения'
                  : 'Замечания модератора'}
              {isCommentRequired && (
                <span className={styles.requiredMark}>*</span>
              )}
            </label>

            <textarea
              id="modal-comment"
              className={styles.textarea}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value)
                if (error) setError(null)
              }}
              placeholder={
                isApprove
                  ? 'Например: Согласовано с дирекцией парка...'
                  : isReject
                    ? 'Укажите причину, например: Нарушение закона о тишине...'
                    : 'Например: Укажите точнее границы зоны проведения...'
              }
              rows={4}
              autoFocus
            />

            {error && <div className={styles.errorText}>{error}</div>}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
          >
            Отмена
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${
              isApprove
                ? styles.actionBtnApprove
                : isReject
                  ? styles.actionBtnReject
                  : styles.actionBtnNeedsChanges
            }`}
            onClick={handleConfirm}
          >
            {isApprove && <IconCheck size={16} />}
            {isReject && <IconX size={16} />}
            {isNeedsChanges && <IconAlertCircle size={16} />}
            <span>
              {isApprove
                ? 'Одобрить'
                : isReject
                  ? 'Отклонить заявку'
                  : 'Отправить запрос'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
