import React from 'react'
import { IconGlobe, IconSparkles, IconCalendar } from '../Icons'
import styles from './PlansEmptyState.module.css'

interface PlansEmptyStateProps {
  type: 'going' | 'past'
  onOpenMap: () => void
  onOpenChat: () => void
}

export const PlansEmptyState: React.FC<PlansEmptyStateProps> = ({
  type,
  onOpenMap,
  onOpenChat,
}) => {
  if (type === 'past') {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.iconCircle}>
          <IconCalendar size={28} color="#9CA3AF" />
        </div>
        <h3 className={styles.title}>История посещений пока пустая</h3>
        <p className={styles.description}>
          Здесь будут сохраняться мероприятия, которые вы уже посетили в Казани.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.emptyContainer}>
      <div className={styles.iconCircle}>
        <IconCalendar size={28} color="#2563EB" />
      </div>
      <h3 className={styles.title}>Пока ничего не запланировано</h3>
      <p className={styles.description}>
        Найдите интересные события на карте Казани или попросите персональные рекомендации у ассистента.
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onOpenMap}
        >
          <IconGlobe size={18} color="#FFFFFF" />
          <span>Открыть карту</span>
        </button>

        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={onOpenChat}
        >
          <IconSparkles size={16} color="#2563EB" />
          <span>Спросить ассистента</span>
        </button>
      </div>
    </div>
  )
}
