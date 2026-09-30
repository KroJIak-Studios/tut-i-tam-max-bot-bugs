import React from 'react'
import { useTranslation } from 'react-i18next'
import type { MapEvent } from '../../types'
import { formatEventDateTimeRange } from '../../utils/formatters'
import { IconCalendar } from '../Icons'
import { EventPhoto } from '../EventPhoto'
import styles from './PlanEventCard.module.css'

interface PlanRequestCardProps {
  event: MapEvent
  onClick: (eventId: string) => void
}

export const PlanRequestCard: React.FC<PlanRequestCardProps> = ({ event, onClick }) => {
  const { t, i18n } = useTranslation()
  const status = event.moderationStatus ?? 'pending'
  const timeDisplay = formatEventDateTimeRange(event, i18n.language)
  const statusLabel = t(`plans.requests.status.${status}`)

  return (
    <article
      className={styles.card}
      onClick={() => onClick(event.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(eventKey) => {
        if (eventKey.key === 'Enter' || eventKey.key === ' ') {
          eventKey.preventDefault()
          onClick(event.id)
        }
      }}
      aria-label={`${event.title}, ${statusLabel}`}
    >
      <div className={styles.imageWrapper}>
        {event.image ? (
          <EventPhoto src={event.image} />
        ) : (
          <div className={`${styles.imagePlaceholder} ${styles.events}`}>
            <IconCalendar size={28} color="#FFFFFF" />
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.infoCol}>
          <h3 className={styles.title}>{event.title}</h3>
          <p className={styles.dateRow}>{timeDisplay}</p>
        </div>
        <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>{statusLabel}</span>
      </div>
    </article>
  )
}
