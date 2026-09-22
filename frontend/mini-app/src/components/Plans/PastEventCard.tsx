import React from 'react'
import type { PastEvent } from '../../mocks/plansData'
import { IconCalendar, IconStar, IconLocationPin, IconCheck } from '../Icons'
import styles from './PastEventCard.module.css'

interface PastEventCardProps {
  event: PastEvent
  onOpenReview: (event: PastEvent) => void
  onClick?: (eventId: string) => void
}

export const PastEventCard: React.FC<PastEventCardProps> = ({
  event,
  onOpenReview,
  onClick,
}) => {
  const displayDate = event.date || event.visitedDate.replace(/^Были\s+/i, '')

  return (
    <article
      className={styles.card}
      onClick={() => onClick?.(event.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(event.id)
        }
      }}
      aria-label={`${event.title}, посещено ${displayDate}`}
    >
      {/* 1. Top main row: Image + Info */}
      <div className={styles.mainRow}>
        <div className={styles.imageWrapper}>
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className={styles.image}
              loading="lazy"
            />
          ) : (
            <div className={`${styles.imagePlaceholder} ${styles[event.category] || styles.events}`}>
              <IconCalendar size={28} color="#FFFFFF" />
            </div>
          )}
        </div>

        <div className={styles.infoCol}>
          <h3 className={styles.title}>{event.title}</h3>

          <div className={styles.dateRow}>
            <IconCheck size={13} color="#10B981" />
            <span>Посещено {displayDate}</span>
          </div>

          <div className={styles.addressRow}>
            <IconLocationPin size={13} color="#9CA3AF" className={styles.pinIcon} />
            <span className={styles.addressText}>{event.address}</span>
          </div>
        </div>
      </div>

      {/* 2. Bottom footer: Review action or status */}
      <div className={styles.footer}>
        {event.hasReview ? (
          <div className={styles.reviewedRow}>
            <div className={styles.ratingBadge}>
              <IconStar size={12} color="#F59E0B" filled />
              <span>{event.rating || 5}</span>
            </div>
            <span className={styles.reviewedLabel}>Отзыв оставлен</span>
          </div>
        ) : (
          <button
            type="button"
            className={styles.leaveReviewBtn}
            onClick={(e) => {
              e.stopPropagation()
              onOpenReview(event)
            }}
          >
            <IconStar size={14} color="#2563EB" filled={false} />
            <span>Оставить отзыв</span>
          </button>
        )}
      </div>
    </article>
  )
}
