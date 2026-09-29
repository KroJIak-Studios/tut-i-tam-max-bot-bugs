import React from 'react'
import { useTranslation } from 'react-i18next'
import type { MapEvent } from '../../types'
import { formatEventDateTimeRange } from '../../utils/formatters'
import { IconCheck, IconUsers, IconCalendar } from '../Icons'
import { EventPhoto } from '../EventPhoto'
import styles from './PlanEventCard.module.css'

interface PlanEventCardProps {
  event: MapEvent
  onClick: (eventId: string) => void
  onRequestRemove: (event: MapEvent) => void
}

export const PlanEventCard: React.FC<PlanEventCardProps> = ({
  event,
  onClick,
  onRequestRemove,
}) => {
  const { t, i18n } = useTranslation()

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRequestRemove(event)
  }

  // Format date display: locale-aware time range
  const timeDisplay = formatEventDateTimeRange(event, i18n.language)

  return (
    <article
      className={styles.card}
      onClick={() => onClick(event.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(event.id)
        }
      }}
      aria-label={`${event.title}, ${timeDisplay}`}
    >
      {/* 1. Left: Image or category placeholder */}
      <div className={styles.imageWrapper}>
        {event.image ? (
          <EventPhoto src={event.image} />
        ) : (
          <div className={`${styles.imagePlaceholder} ${styles.events}`}>
            <IconCalendar size={28} color="#FFFFFF" />
          </div>
        )}
      </div>

      {/* 2. Middle/Right: Info & Action */}
      <div className={styles.content}>
        <div className={styles.infoCol}>
          <h3 className={styles.title}>{event.title}</h3>
          <p className={styles.dateRow}>{timeDisplay}</p>
          {event.attendeesCount > 0 && (
            <div className={styles.attendeesRow}>
              <IconUsers size={14} color="#6B7280" />
              <span>{t('events.attendeesCount', { count: event.attendeesCount })}</span>
            </div>
          )}
        </div>

        {/* 3. Compact participation badge/button */}
        <button
          type="button"
          className={styles.goingBadge}
          onClick={handleBadgeClick}
          aria-label={t('plans.manageAttendanceAriaLabel')}
          title={t('plans.manageAttendanceTitle')}
        >
          <IconCheck size={14} color="#2563EB" />
          <span>{t('events.imGoing')}</span>
        </button>
      </div>
    </article>
  )
}
