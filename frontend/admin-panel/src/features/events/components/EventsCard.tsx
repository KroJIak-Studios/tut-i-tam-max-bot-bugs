import React from 'react'
import {
  Calendar,
  MapPin,
  Tag,
  Eye,
  Image as ImageIcon,
  MessageCircle,
  CreditCard,
} from 'lucide-react'
import {
  formatEventDateTime,
  formatEventPrice,
  getOriginBadge,
  getPhaseBadge,
  getVisibilityBadge,
  getFirstImageUrl,
  resolveCityName,
  resolveCategoryName,
} from '../utils/eventFormatters'
import type { City } from '../../cities/types/city'
import type { EventCategory } from '../../categories/types'
import type { AdminEventItem } from '../types'
import styles from './EventsCard.module.css'

interface EventsCardProps {
  event: AdminEventItem
  cities: City[]
  categories: EventCategory[]
  onOpenDetail: (event: AdminEventItem) => void
  onOpenPhotos: (event: AdminEventItem) => void
}

export const EventsCard: React.FC<EventsCardProps> = ({
  event,
  cities,
  categories,
  onOpenDetail,
  onOpenPhotos,
}) => {
  const originInfo = getOriginBadge(event.origin)
  const phaseInfo = getPhaseBadge(event.phase)
  const visibilityInfo = getVisibilityBadge(event.visible)
  const cityName = resolveCityName(event.city_id, cities)
  const categoryName = resolveCategoryName(event.category_id, categories)
  const priceDisplay = formatEventPrice(event)
  const hasPhotos = event.images && event.images.length > 0
  const firstPhoto = getFirstImageUrl(event.images)

  return (
    <article className={styles.card} aria-label={`Мероприятие: ${event.title}`}>
      <div className={styles.topRow}>
        <div className={styles.badgesGroup}>
          <span
            className={`${styles.badge} ${
              event.origin === 'official' ? styles.badgeOfficial : styles.badgeUser
            }`}
          >
            {originInfo.label}
          </span>
          <span
            className={`${styles.badge} ${
              event.visible ? styles.badgeVisible : styles.badgeHidden
            }`}
          >
            {visibilityInfo.label}
          </span>
          <span
            className={`${styles.badge} ${
              event.phase === 'ongoing'
                ? styles.badgeOngoing
                : event.phase === 'scheduled'
                  ? styles.badgeScheduled
                  : styles.badgeFinished
            }`}
          >
            {phaseInfo.label}
          </span>
        </div>

        <div
          className={`${styles.chatIndicator} ${
            !event.chat_connected ? styles.chatIndicatorOff : ''
          }`}
          title={
            event.chat_connected
              ? 'Чат MAX подключен к мероприятию'
              : 'Чат не подключен'
          }
          aria-label={
            event.chat_connected
              ? 'Чат MAX подключен'
              : 'Чат не подключен'
          }
        >
          <MessageCircle size={15} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.mediaContainer}>
        {firstPhoto ? (
          <img
            src={firstPhoto}
            alt={event.title}
            className={styles.coverImage}
            loading="lazy"
            onError={(e) => {
              // Hide broken image link and show fallback
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className={styles.placeholderCover} aria-hidden="true">
            <ImageIcon size={28} />
            <span>Нет фото</span>
          </div>
        )}
        {hasPhotos && (
          <div className={styles.photosCountBadge}>
            <ImageIcon size={12} aria-hidden="true" />
            <span>{event.images.length}</span>
          </div>
        )}
      </div>

      <div className={styles.titleArea}>
        <h2 className={styles.title}>{event.title}</h2>
      </div>

      <div className={styles.metaList}>
        <div className={styles.metaItem}>
          <Calendar size={14} className={styles.metaIcon} aria-hidden="true" />
          <span className={styles.metaText}>
            {formatEventDateTime(event.starts_at, event.ends_at)}
          </span>
        </div>

        <div className={styles.metaItem}>
          <MapPin size={14} className={styles.metaIcon} aria-hidden="true" />
          <span className={styles.metaText} title={`${cityName}, ${event.address}`}>
            {cityName} • {event.address}
          </span>
        </div>

        <div className={styles.metaItem}>
          <Tag size={14} className={styles.metaIcon} aria-hidden="true" />
          <span className={styles.metaText}>{categoryName}</span>
        </div>
      </div>

      <div className={styles.pricingRow}>
        <div
          className={`${styles.priceTag} ${
            priceDisplay === 'Бесплатно' ? styles.priceFree : ''
          }`}
        >
          {priceDisplay}
        </div>

        {event.pushkin_card && (
          <span className={styles.pushkinBadge}>
            <CreditCard size={12} aria-hidden="true" />
            <span>Пушкинская карта</span>
          </span>
        )}
      </div>

      <div className={styles.actionsRow}>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
          onClick={() => onOpenDetail(event)}
          aria-label={`Открыть подробности: ${event.title}`}
        >
          <Eye size={15} aria-hidden="true" />
          <span>Подробнее</span>
        </button>

        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
          onClick={() => onOpenPhotos(event)}
          aria-label={`Управление фотографиями: ${event.title}`}
        >
          <ImageIcon size={15} aria-hidden="true" />
          <span>Фото ({event.images?.length || 0})</span>
        </button>
      </div>
    </article>
  )
}
