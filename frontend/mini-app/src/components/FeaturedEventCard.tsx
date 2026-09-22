import React from 'react'
import type { EventItem } from '../types'
import { IconChevronRight, IconCalendar, IconSparkles } from './Icons'
import styles from './FeaturedEventCard.module.css'

interface FeaturedEventCardProps {
  event: EventItem
  onClick?: (id: string) => void
}

export const FeaturedEventCard: React.FC<FeaturedEventCardProps> = ({ event, onClick }) => {
  return (
    <button
      type="button"
      className={styles.eventCard}
      onClick={() => onClick?.(event.id)}
      aria-label={`${event.tag || 'Рекомендуем'}, ${event.title}, ${event.date}, ${event.price}`}
    >
      <div className={styles.imageWrapper}>
        <img
          src={event.imageUrl}
          alt={event.title}
          className={styles.eventImage}
          loading="lazy"
        />
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.badgeRow}>
          <span className={styles.recommendBadge}>
            <IconSparkles size={11} color="#2563EB" />
            <span>{event.tag || 'Рекомендуем сегодня'}</span>
          </span>
        </div>

        <h4 className={styles.eventTitle}>{event.title}</h4>

        <div className={styles.metaRow}>
          <div className={styles.dateInfo}>
            <IconCalendar size={13} className={styles.calendarIcon} />
            <span>{event.date}</span>
          </div>
          <span className={styles.pricePill}>{event.price}</span>
        </div>
      </div>

      <div className={styles.arrowIcon} aria-hidden="true">
        <IconChevronRight size={14} />
      </div>
    </button>
  )
}

