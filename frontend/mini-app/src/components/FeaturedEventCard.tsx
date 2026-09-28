import React from 'react'
import { useTranslation } from 'react-i18next'
import type { EventItem } from '../types'
import { IconChevronRight, IconCalendar, IconSparkles } from './Icons'
import { formatEventDateTime } from '../utils/formatters'
import styles from './FeaturedEventCard.module.css'

interface FeaturedEventCardProps {
  event: EventItem
  onClick?: (id: string) => void
}

export const FeaturedEventCard: React.FC<FeaturedEventCardProps> = ({ event, onClick }) => {
  const { t, i18n } = useTranslation()
  const tagText = t('home.recommendedToday')

  // Parse date and time if "сегодня · 19:00"
  let displayDate = event.date
  if (event.date.includes('·')) {
    const [dPart, tPart] = event.date.split('·').map((s) => s.trim())
    displayDate = formatEventDateTime(dPart, tPart, i18n.language)
  }

  // Display price
  const isFree =
    event.price.toLowerCase().includes('бесплатно') ||
    event.price.toLowerCase().includes('free') ||
    event.price === '0'
  const displayPrice = isFree ? t('common.free') : event.price

  return (
    <button
      type="button"
      className={styles.eventCard}
      onClick={() => onClick?.(event.id)}
      aria-label={`${tagText}, ${event.title}, ${displayDate}, ${displayPrice}`}
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
            <span>{tagText}</span>
          </span>
        </div>

        <h4 className={styles.eventTitle}>{event.title}</h4>

        <div className={styles.metaRow}>
          <div className={styles.dateInfo}>
            <IconCalendar size={13} className={styles.calendarIcon} />
            <span>{displayDate}</span>
          </div>
          <span className={styles.pricePill}>{displayPrice}</span>
        </div>
      </div>

      <div className={styles.arrowIcon} aria-hidden="true">
        <IconChevronRight size={14} />
      </div>
    </button>
  )
}

