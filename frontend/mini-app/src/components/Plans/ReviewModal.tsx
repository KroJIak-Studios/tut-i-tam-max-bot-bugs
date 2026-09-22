import React, { useState, useEffect } from 'react'
import type { PastEvent } from '../../mocks/plansData'
import { IconStar, IconClose } from '../Icons'
import styles from './ReviewModal.module.css'

interface ReviewModalProps {
  event: PastEvent | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (eventId: string, rating: number, comment: string) => void
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  event,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(event.id, rating, comment)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.modalSheet}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.dragPill} />
          <div className={styles.headerTop}>
            <h3 className={styles.title}>Оставить отзыв</h3>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Закрыть"
            >
              <IconClose size={20} color="#6B7280" />
            </button>
          </div>
          <p className={styles.eventTitle}>{event.title}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.ratingRow}>
            <span className={styles.ratingLabel}>Ваша оценка:</span>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={styles.starBtn}
                  onClick={() => setRating(star)}
                  aria-label={`${star} звезд`}
                >
                  <IconStar
                    size={26}
                    color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                    filled={star <= rating}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="review-comment" className={styles.fieldLabel}>
              Комментарий (необязательно)
            </label>
            <textarea
              id="review-comment"
              className={styles.textarea}
              rows={3}
              placeholder="Поделитесь впечатлениями о мероприятии..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Отправить отзыв
          </button>
        </form>
      </div>
    </div>
  )
}
