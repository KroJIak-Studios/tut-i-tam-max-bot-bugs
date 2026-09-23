import React from 'react'
import type { MapEvent } from '../../types'
import { IconClock, IconTag, IconUsers, IconCheck } from '../Icons'
import styles from './MapEventCard.module.css'

interface MapEventCardProps {
  event: MapEvent
  onToggleGoing: (eventId: string) => void
  onMoreDetails?: (event: MapEvent) => void
}

export const MapEventCard: React.FC<MapEventCardProps> = ({
  event,
  onToggleGoing,
  onMoreDetails,
}) => {
  return (
    <div className={styles.cardWrapper} role="region" aria-label={`Событие: ${event.title}`}>
      <div
        className={styles.clickableBody}
        onClick={() => onMoreDetails?.(event)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onMoreDetails?.(event)
          }
        }}
        aria-label={`Подробнее о событии: ${event.title}`}
      >
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            {event.source === 'user' && (
              <span className={styles.userBadge}>Добавлено пользователем</span>
            )}
            <h2 className={styles.title}>{event.title}</h2>
          </div>
        </div>

        <div className={styles.infoList}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>
              <IconClock size={15} color="currentColor" />
            </span>
            <span>{event.date} {event.startTime}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>
              <IconTag size={15} color="currentColor" />
            </span>
            <span>
              {event.isFree || event.price === 0
                ? 'бесплатно'
                : `${event.price} ₽${event.pushkinCard ? ' • Пушкинская карта' : ''}`}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>
              <IconUsers size={15} color="currentColor" />
            </span>
            <span>{event.attendeesCount} идут</span>
          </div>
        </div>

        <div className={styles.detailsLink}>
          <span>Подробнее</span>
          <span aria-hidden="true">→</span>
        </div>
      </div>

      <button
        type="button"
        className={`${styles.actionButton} ${event.isGoing ? styles.actionButtonGoing : ''}`}
        onClick={() => onToggleGoing(event.id)}
      >
        {event.isGoing ? (
          <>
            <IconCheck size={16} color="#FFFFFF" />
            <span>Вы идёте</span>
          </>
        ) : (
          <span>Я приду</span>
        )}
      </button>
    </div>
  )
}
