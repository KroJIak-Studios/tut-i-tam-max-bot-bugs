import React from 'react'
import { Calendar, MapPin, Tag, Image as ImageIcon, CreditCard } from 'lucide-react'
import {
  formatEventDateTime,
  formatEventPrice,
  getOriginBadge,
  getPhaseBadge,
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
  onEdit: (event: AdminEventItem) => void
  onToggleVisible: (event: AdminEventItem) => void
}

export const EventsCard: React.FC<EventsCardProps> = ({
  event,
  cities,
  categories,
  onEdit,
  onToggleVisible,
}) => {
  const originInfo = getOriginBadge(event.origin)
  const phaseInfo = getPhaseBadge(event.phase)
  const cityName = resolveCityName(event.city_id, cities)
  const categoryName = resolveCategoryName(event.category_id, categories)
  const priceDisplay = formatEventPrice(event)
  const firstPhoto = getFirstImageUrl(event.images)

  return (
    <article className={styles.card} onClick={() => onEdit(event)}>
      <div className={styles.media}>
        {firstPhoto ? <img src={firstPhoto} alt="" /> : <div className={styles.placeholder}><ImageIcon size={28} /><span>Нет фото</span></div>}
        <div className={styles.badges}>
          <span>{originInfo.label}</span>
          <span>{phaseInfo.label}</span>
          {event.images.length > 1 && <span>{event.images.length} фото</span>}
        </div>
      </div>
      <div className={styles.body}>
        <h2>{event.title}</h2>
        <p><Calendar size={14} />{formatEventDateTime(event.starts_at, event.ends_at)}</p>
        <p><MapPin size={14} />{cityName} · {event.address}</p>
        <p><Tag size={14} />{categoryName}</p>
        <div className={styles.priceRow}>
          <strong className={priceDisplay === 'Бесплатно' ? styles.free : ''}>{priceDisplay}</strong>
          {event.pushkin_card && <span className={styles.pushkin}><CreditCard size={12} />Пушкинская карта</span>}
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={(click) => { click.stopPropagation(); onEdit(event) }}>Редактировать</button>
          <button
            type="button"
            className={event.visible ? styles.visible : styles.hidden}
            aria-pressed={event.visible}
            onClick={(click) => { click.stopPropagation(); onToggleVisible(event) }}
          >
            {event.visible ? 'Показан' : 'Скрыт'}
          </button>
        </div>
      </div>
    </article>
  )
}
