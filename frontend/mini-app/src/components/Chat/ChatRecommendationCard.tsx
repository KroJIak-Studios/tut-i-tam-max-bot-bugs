import React, { useState } from 'react'
import type { MapEvent } from '../../types'
import { toggleEventAttendance } from '../../services/mapService'
import { IconClock, IconTag, IconUsers, IconCheck, IconChat, IconLocationPin } from '../Icons'
import { ChatMiniMap } from './ChatMiniMap'
import styles from './ChatRecommendationCard.module.css'

interface ChatRecommendationCardProps {
  event: MapEvent
  onOpenOnMap: (eventId: string) => void
  onToast: (message: string) => void
}

export const ChatRecommendationCard: React.FC<ChatRecommendationCardProps> = ({
  event: initialEvent,
  onOpenOnMap,
  onToast,
}) => {
  const [event, setEvent] = useState<MapEvent>(initialEvent)
  const [isToggling, setIsToggling] = useState(false)

  const handleToggleAttendance = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isToggling) return
    setIsToggling(true)
    try {
      const updated = await toggleEventAttendance(event.id)
      setEvent(updated)
    } catch (err) {
      console.error('Failed to toggle attendance:', err)
    } finally {
      setIsToggling(false)
    }
  }

  const handleOpenEventChat = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToast('Чат мероприятия появится в следующем обновлении')
  }

  return (
    <div className={styles.cardContainer}>
      <div className={styles.header}>
        <h4 className={styles.title}>{event.title}</h4>
        {event.address && (
          <div className={styles.addressRow}>
            <IconLocationPin size={14} color="#6B7280" />
            <span className={styles.addressText}>{event.address}</span>
          </div>
        )}
      </div>

      <div className={styles.metaRow}>
        <div className={styles.metaItem}>
          <IconClock size={14} color="#6B7280" />
          <span>{event.date} {event.startTime}</span>
        </div>
        <div className={styles.metaItem}>
          <IconTag size={14} color="#6B7280" />
          <span>{event.isFree || event.price === 0 ? 'Бесплатно' : `${event.price} ₽`}</span>
        </div>
        <div className={styles.metaItem}>
          <IconUsers size={14} color="#6B7280" />
          <span>{event.attendeesCount} идут</span>
        </div>
      </div>

      {/* Интерактивная легкая мини-карта */}
      <ChatMiniMap
        latitude={event.latitude}
        longitude={event.longitude}
        title={event.title}
        onClick={() => onOpenOnMap(event.id)}
      />

      {/* Кнопки действий */}
      <div className={styles.actionsGrid}>
        <button
          type="button"
          className={`${styles.actionBtn} ${event.isGoing ? styles.actionBtnActive : styles.actionBtnSecondary}`}
          onClick={handleToggleAttendance}
          disabled={isToggling}
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

        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
          onClick={() => onOpenOnMap(event.id)}
        >
          <span>На карте</span>
        </button>
      </div>

      {/* Дополнительная кнопка перехода в чат события */}
      <button
        type="button"
        className={styles.eventChatLinkBtn}
        onClick={handleOpenEventChat}
      >
        <IconChat size={15} color="#2563EB" />
        <span>Чат события</span>
      </button>
    </div>
  )
}
