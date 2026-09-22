import React from 'react'
import type { PastEvent } from '../../mocks/plansData'
import { IconCalendar, IconStar } from '../Icons'
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
      aria-label={`${event.title}, ${event.visitedDate}`}
    >
      {/* 1. Left: Image */}
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

      {/* 2. Middle & Right info */}
      <div className={styles.content}>
        <div className={styles.infoCol}>
          <h3 className={styles.title}>{event.title}</h3>
          <p className={styles.visitedRow}>{event.visitedDate}</p>
          <p className={styles.addressRow}>{event.address}</p>
        </div>

        {/* 3. Review state or button */}
        <div className={styles.actionCol}>
          {event.hasReview ? (
            <div className={styles.reviewDoneBadge}>
              <IconStar size={13} color="#F59E0B" filled />
              <span>{event.rating || 5}</span>
            </div>
          ) : (
            <button
              type="button"
              className={styles.reviewBtn}
              onClick={(e) => {
                e.stopPropagation()
                onOpenReview(event)
              }}
            >
              Отзыв
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
