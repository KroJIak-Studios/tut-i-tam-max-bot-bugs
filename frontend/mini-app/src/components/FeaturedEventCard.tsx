import React from 'react'
import type { EventItem } from '../types'
import { IconChevronRight, IconCalendar, IconTicket } from './Icons'
import styles from './FeaturedEventCard.module.css'

interface FeaturedEventCardProps {
  event: EventItem
  onClick?: (id: string) => void
}

export const FeaturedEventCard: React.FC<FeaturedEventCardProps> = ({ event, onClick }) => {
  return (
    <div
      className={styles.eventCard}
      onClick={() => onClick?.(event.id)}
      role="button"
      tabIndex={0}
      aria-label={`${event.title}, ${event.date}, ${event.price}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(event.id)
        }
      }}
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
        <h4 className={styles.eventTitle}>{event.title}</h4>

        <div className={styles.infoRow}>
          <IconCalendar size={15} className={styles.infoIcon} />
          <span>{event.date}</span>
        </div>

        <div className={styles.infoRow}>
          <IconTicket size={15} className={styles.infoIcon} />
          <span>{event.price}</span>
        </div>
      </div>

      <div className={styles.arrowButton} aria-hidden="true">
        <IconChevronRight size={14} />
      </div>
    </div>
  )
}
