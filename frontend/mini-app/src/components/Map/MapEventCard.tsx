import React from 'react'
import { useTranslation } from 'react-i18next'
import type { MapEvent } from '../../types'
import { IconClock, IconTag, IconUsers, IconCheck } from '../Icons'
import { formatEventDateTimeRange, isEventActiveAt } from '../../utils/eventTime'
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
  const { t, i18n } = useTranslation()
  const dateTimeText = formatEventDateTimeRange(event, i18n.language)
  const isActiveNow = isEventActiveAt(event, new Date())

  const priceDisplay =
    event.isFree || event.price === 0
      ? t('events.free')
      : `${event.price} ₽${event.pushkinCard ? ` • ${t('events.pushkinCard')}` : ''}`

  return (
    <div
      className={styles.cardWrapper}
      role="region"
      aria-label={t('map.eventAriaLabel', { title: event.title })}
    >
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
        aria-label={t('map.eventDetailsAriaLabel', { title: event.title })}
      >
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            {isActiveNow && (
              <span className={styles.activeNowBadge}>{t('events.happeningNow', 'Идёт сейчас')}</span>
            )}
            {event.source === 'user' && (
              <span className={styles.userBadge}>{t('events.userAdded')}</span>
            )}
            <h2 className={styles.title}>{event.title}</h2>
          </div>
        </div>

        <div className={styles.infoList}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>
              <IconClock size={15} color="currentColor" />
            </span>
            <span>{dateTimeText}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>
              <IconTag size={15} color="currentColor" />
            </span>
            <span>{priceDisplay}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>
              <IconUsers size={15} color="currentColor" />
            </span>
            <span>{t('events.attendeesCount', { count: event.attendeesCount })}</span>
          </div>
        </div>

        <div className={styles.detailsLink}>
          <span>{t('map.details')}</span>
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
            <span>{t('events.youreGoing')}</span>
          </>
        ) : (
          <span>{t('events.imGoing')}</span>
        )}
      </button>
    </div>
  )
}
