import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { NotificationSettings } from '../../types'
import { IconClose } from '../Icons'
import styles from './NotificationsModal.module.css'

interface NotificationsModalProps {
  settings: NotificationSettings
  onClose: () => void
  onChange: (settings: Partial<NotificationSettings>) => void
}

interface NotificationItem {
  id: keyof NotificationSettings
  label: string
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  settings,
  onClose,
  onChange,
}) => {
  const { t } = useTranslation()

  const notificationItems: NotificationItem[] = [
    { id: 'interestEvents', label: t('profile.notificationInterestEvents') },
    { id: 'eventReminders', label: t('profile.notificationReminders') },
    { id: 'aiRecommendations', label: t('profile.notificationAiRecommendations') },
    { id: 'scheduleChanges', label: t('profile.notificationScheduleChanges') },
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const handleToggle = (id: keyof NotificationSettings) => {
    onChange({ [id]: !settings[id] })
  }

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('profile.notifications')}
    >
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{t('profile.notifications')}</h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <IconClose size={18} color="currentColor" />
          </button>
        </div>

        <div className={styles.subtitle}>
          {t('profile.notificationsModalSubtitle')}
        </div>

        <div className={styles.switchesList} role="group" aria-label={t('profile.notifications')}>
          {notificationItems.map((item) => (
            <label key={item.id} className={styles.switchRow}>
              <span className={styles.switchLabel}>{item.label}</span>
              <div className={styles.switchControl}>
                <input
                  type="checkbox"
                  className={styles.switchInput}
                  checked={settings[item.id]}
                  onChange={() => handleToggle(item.id)}
                  aria-label={item.label}
                />
                <span className={styles.switchTrack} />
              </div>
            </label>
          ))}
        </div>

        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.doneBtn}
            onClick={onClose}
          >
            {t('common.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
