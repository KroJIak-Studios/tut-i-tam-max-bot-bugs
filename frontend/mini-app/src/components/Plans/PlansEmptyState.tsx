import React from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  if (type === 'past') {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.iconCircle}>
          <IconCalendar size={28} color="#9CA3AF" />
        </div>
        <h3 className={styles.title}>{t('plans.empty.pastTitle')}</h3>
        <p className={styles.description}>
          {t('plans.empty.pastDescription')}
        </p>
      </div>
    )
  }

  return (
    <div className={styles.emptyContainer}>
      <div className={styles.iconCircle}>
        <IconCalendar size={28} color="#2563EB" />
      </div>
      <h3 className={styles.title}>{t('plans.empty.goingTitle')}</h3>
      <p className={styles.description}>
        {t('plans.empty.goingDescription')}
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onOpenMap}
        >
          <IconGlobe size={18} color="#FFFFFF" />
          <span>{t('plans.empty.openMap')}</span>
        </button>

        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={onOpenChat}
        >
          <IconSparkles size={16} color="#2563EB" />
          <span>{t('plans.empty.askAssistant')}</span>
        </button>
      </div>
    </div>
  )
}
