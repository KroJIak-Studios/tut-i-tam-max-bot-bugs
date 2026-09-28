import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { MapEvent } from '../../types'
import { useAttendance } from '../../context/useAttendance'
import { formatEventDateTime, formatPrice } from '../../utils/formatters'
import { IconClock, IconTag, IconUsers, IconCheck, IconChat, IconLocationPin } from '../Icons'
import { ChatMiniMap } from './ChatMiniMap'
import styles from './ChatRecommendationCard.module.css'

interface ChatRecommendationCardProps {
  event: MapEvent
  onOpenOnMap: (eventId: string) => void
  onToast: (message: string) => void
}

export const ChatRecommendationCard: React.FC<ChatRecommendationCardProps> = ({
  event,
  onOpenOnMap,
  onToast,
}) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isGoing, toggleAttendance } = useAttendance()
  const going = isGoing(event.id)
  const [isToggling, setIsToggling] = useState(false)

  const handleToggleAttendance = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isToggling) return
    setIsToggling(true)
    try {
      await toggleAttendance(event.id)
    } catch (err) {
      console.error('Failed to toggle attendance:', err)
    } finally {
      setIsToggling(false)
    }
  }

  const handleOpenEventChat = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToast(t('chat.eventChatToast'))
  }

  const handleOpenDetails = () => {
    navigate(`/events/${event.id}`)
  }

  return (
    <div className={styles.recommendationContainer}>
      <div className={styles.divider} />
      <div
        className={styles.eventInfoLink}
        onClick={handleOpenDetails}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleOpenDetails()
          }
        }}
        aria-label={t('chat.detailsAriaLabel', { title: event.title })}
      >
        <div className={styles.header}>
          <h4 className={styles.title}>{event.title}</h4>
          {event.address && (
            <div className={styles.addressRow}>
              <IconLocationPin size={13} color="#6B7280" />
              <span className={styles.addressText}>{event.address}</span>
            </div>
          )}
        </div>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <IconClock size={14} color="#6B7280" />
            <span>{formatEventDateTime(event.date, event.startTime, i18n.language)}</span>
          </div>
          <div className={styles.metaItem}>
            <IconTag size={14} color="#6B7280" />
            <span>{event.isFree || event.price === 0 ? t('events.free') : formatPrice(event.price, i18n.language)}</span>
          </div>
          <div className={styles.metaItem}>
            <IconUsers size={14} color="#6B7280" />
            <span>{t('events.attendeesCount', { count: event.attendeesCount })}</span>
          </div>
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
          className={`${styles.actionBtn} ${going ? styles.actionBtnActive : styles.actionBtnSecondary}`}
          onClick={handleToggleAttendance}
          disabled={isToggling}
        >
          {going ? (
            <>
              <IconCheck size={16} color="#FFFFFF" />
              <span>{t('events.youreGoing')}</span>
            </>
          ) : (
            <span>{t('events.imGoing')}</span>
          )}
        </button>

        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
          onClick={() => onOpenOnMap(event.id)}
        >
          <span>{t('chat.onMap')}</span>
        </button>
      </div>

      {/* Дополнительная кнопка перехода в чат события */}
      <button
        type="button"
        className={styles.eventChatLinkBtn}
        onClick={handleOpenEventChat}
      >
        <IconChat size={15} color="#2563EB" />
        <span>{t('chat.eventChat')}</span>
      </button>
    </div>
  )
}
