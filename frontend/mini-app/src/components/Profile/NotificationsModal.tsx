import React, { useEffect } from 'react'
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

const NOTIFICATION_ITEMS: NotificationItem[] = [
  { id: 'interestEvents', label: 'Новые события по интересам' },
  { id: 'eventReminders', label: 'Напоминания о запланированном' },
  { id: 'aiRecommendations', label: 'Персональные рекомендации AI' },
  { id: 'scheduleChanges', label: 'Изменения в расписании' },
]

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  settings,
  onClose,
  onChange,
}) => {
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
      aria-label="Настройки уведомлений"
    >
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>Уведомления</h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Закрыть"
          >
            <IconClose size={18} color="currentColor" />
          </button>
        </div>

        <div className={styles.subtitle}>
          Настройте важные для вас оповещения и напоминания:
        </div>

        <div className={styles.switchesList} role="group" aria-label="Параметры уведомлений">
          {NOTIFICATION_ITEMS.map((item) => (
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
            Готово
          </button>
        </div>
      </div>
    </div>
  )
}
