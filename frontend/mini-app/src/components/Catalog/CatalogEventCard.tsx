import React from 'react'
import { useTranslation } from 'react-i18next'
import type { MapEvent } from '../../types'
import { IconClock, IconLocationPin, IconUsers } from '../Icons'
import { formatEventDateTimeRange, isEventActiveAt } from '../../utils/eventTime'
import { formatDistance } from '../../utils/geoUtils'
import styles from './CatalogEventCard.module.css'

interface CatalogEventCardProps {
  event: MapEvent
  distanceMeters: number
  onCardClick: (eventId: string) => void
  onMapClick: (eventId: string) => void
}

export const CatalogEventCard: React.FC<CatalogEventCardProps> = ({
  event,
  distanceMeters,
  onCardClick,
  onMapClick,
}) => {
  const { t, i18n } = useTranslation()
  const imgSrc = event.image || event.images?.[0] || '/event-embankment.jpg'
  const dateTimeText = formatEventDateTimeRange(event, i18n.language)
  const isActiveNow = isEventActiveAt(event, new Date())
  const distanceText = formatDistance(distanceMeters, i18n.language)
  const locationText = event.address ? `${distanceText} · ${event.address}` : distanceText

  const handleCardClick = () => {
    onCardClick(event.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onCardClick(event.id)
    }
  }

  const handleMapAction = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMapClick(event.id)
  }

  return (
    <article
      className={styles.card}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${event.title}, ${dateTimeText}, ${locationText}`}
    >
      <div className={styles.mainRow}>
        {/* Фото события */}
        <div className={styles.imageContainer}>
          <img
            src={imgSrc}
            alt={event.title}
            className={styles.image}
            loading="lazy"
          />
        </div>

        {/* Текстовая информация */}
        <div className={styles.details}>
          <div className={styles.topMeta}>
            <span className={styles.dateTime}>
              <IconClock size={12} color="currentColor" />
              <span>{dateTimeText}</span>
            </span>

            {event.isFree || event.price === 0 ? (
              <span className={styles.freeBadge}>{t('events.free')}</span>
            ) : (
              <span className={styles.priceText}>{event.price} ₽</span>
            )}
          </div>

          <h3 className={styles.title}>{event.title}</h3>

          <div className={styles.chipsRow}>
            {isActiveNow && (
              <span className={styles.activeBadge}>{t('events.happeningNow', 'Идёт сейчас')}</span>
            )}

            {event.attendeesCount > 0 && (
              <span className={styles.attendees}>
                <IconUsers size={12} color="currentColor" />
                <span>{t('events.attendeesCount', { count: event.attendeesCount })}</span>
              </span>
            )}

            {event.pushkinCard && (
              <span className={styles.pushkinBadge}>{t('events.pushkinCardShort')}</span>
            )}

            {event.categoryName && <span className={styles.categoryBadge}>{event.categoryName}</span>}
          </div>
        </div>
      </div>

      {/* Нижняя строка: расстояние/адрес и кнопка «На карте» */}
      <div className={styles.footerRow}>
        <div className={styles.locationInfo} title={locationText}>
          <IconLocationPin size={13} color="currentColor" className={styles.locationPinIcon} />
          <span className={styles.locationText}>{locationText}</span>
        </div>

        <button
          type="button"
          className={styles.mapBtn}
          onClick={handleMapAction}
          aria-label={`${t('catalog.showOnMap')}: ${event.title}`}
        >
          <IconLocationPin size={12} color="currentColor" />
          <span>{t('catalog.onMap')}</span>
        </button>
      </div>
    </article>
  )
}
