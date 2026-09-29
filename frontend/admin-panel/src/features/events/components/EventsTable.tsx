import React from 'react'
import { Eye, Image as ImageIcon, CheckCircle2, XCircle } from 'lucide-react'
import {
  formatEventDateTime,
  formatEventPrice,
  getOriginBadge,
  resolveCityName,
  resolveCategoryName,
} from '../utils/eventFormatters'
import type { City } from '../../cities/types/city'
import type { EventCategory } from '../../categories/types'
import type { AdminEventItem } from '../types'
import styles from './EventsTable.module.css'

interface EventsTableProps {
  events: AdminEventItem[]
  cities: City[]
  categories: EventCategory[]
  onOpenDetail: (event: AdminEventItem) => void
  onOpenPhotos: (event: AdminEventItem) => void
}

export const EventsTable: React.FC<EventsTableProps> = ({
  events,
  cities,
  categories,
  onOpenDetail,
  onOpenPhotos,
}) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Мероприятие</th>
            <th className={styles.th}>Город</th>
            <th className={styles.th}>Категория</th>
            <th className={styles.th}>Тип</th>
            <th className={styles.th}>Дата и время</th>
            <th className={styles.th}>Стоимость</th>
            <th className={styles.th}>Чат</th>
            <th className={styles.th}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const originInfo = getOriginBadge(event.origin)
            const cityName = resolveCityName(event.city_id, cities)
            const categoryName = resolveCategoryName(event.category_id, categories)
            const priceDisplay = formatEventPrice(event)
            const firstPhoto = event.images && event.images.length > 0 ? event.images[0] : null

            return (
              <tr key={event.id} className={styles.tr}>
                <td className={styles.td}>
                  <div className={styles.eventCell}>
                    {firstPhoto ? (
                      <img
                        src={firstPhoto}
                        alt=""
                        className={styles.eventThumb}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className={styles.thumbPlaceholder} aria-hidden="true">
                        <ImageIcon size={18} />
                      </div>
                    )}
                    <div className={styles.eventInfo}>
                      <span className={styles.eventTitle} title={event.title}>
                        {event.title}
                      </span>
                      <span className={styles.eventAddress} title={event.address}>
                        {event.address}
                      </span>
                    </div>
                  </div>
                </td>

                <td className={styles.td}>{cityName}</td>

                <td className={styles.td}>{categoryName}</td>

                <td className={styles.td}>
                  <span
                    className={`${styles.badge} ${
                      event.origin === 'official' ? styles.badgeOfficial : styles.badgeUser
                    }`}
                  >
                    {originInfo.label}
                  </span>
                </td>

                <td className={styles.td}>
                  {formatEventDateTime(event.starts_at, event.ends_at)}
                </td>

                <td className={styles.td}>
                  <div
                    className={`${styles.priceTag} ${
                      priceDisplay === 'Бесплатно' ? styles.priceFree : ''
                    }`}
                  >
                    {priceDisplay}
                  </div>
                  {event.pushkin_card && (
                    <span className={styles.pushkinPill}>Пушкинская карта</span>
                  )}
                </td>

                <td className={styles.td}>
                  {event.chat_connected ? (
                    <span className={styles.chatActive}>
                      <CheckCircle2 size={14} aria-hidden="true" />
                      <span>Подключен</span>
                    </span>
                  ) : (
                    <span className={styles.chatInactive}>
                      <XCircle size={14} aria-hidden="true" />
                      <span>Нет</span>
                    </span>
                  )}
                </td>

                <td className={styles.td}>
                  <div className={styles.actionsCell}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => onOpenDetail(event)}
                      title="Просмотреть подробности"
                      aria-label={`Подробности: ${event.title}`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => onOpenPhotos(event)}
                      title={`Управление фото (${event.images?.length || 0})`}
                      aria-label={`Фото: ${event.title}`}
                    >
                      <ImageIcon size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
