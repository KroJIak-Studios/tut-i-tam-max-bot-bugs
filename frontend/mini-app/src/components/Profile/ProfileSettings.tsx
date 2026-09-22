import React from 'react'
import type { MapProvider } from '../../types'
import { IconChevronRight } from '../Icons'
import styles from './ProfileSettings.module.css'

interface ProfileSettingsProps {
  pushkinCard: boolean
  defaultMapProvider: MapProvider
  onTogglePushkinCard: () => void
  onOpenMapModal: () => void
  onOpenNotificationsModal: () => void
}

const PROVIDER_NAMES: Record<MapProvider, string> = {
  yandex: 'Яндекс',
  '2gis': '2ГИС',
  system: 'Системные',
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  pushkinCard,
  defaultMapProvider,
  onTogglePushkinCard,
  onOpenMapModal,
  onOpenNotificationsModal,
}) => {
  return (
    <section className={styles.card} aria-label="Настройки">
      {/* 1. Пушкинская карта */}
      <label className={styles.settingRow}>
        <span className={styles.settingLabel}>Пушкинская карта</span>
        <div className={styles.switchControl}>
          <input
            type="checkbox"
            className={styles.switchInput}
            checked={pushkinCard}
            onChange={onTogglePushkinCard}
            aria-label="Пушкинская карта"
          />
          <span className={styles.switchTrack} />
        </div>
      </label>

      {/* 2. Карты по умолчанию */}
      <div
        className={`${styles.settingRow} ${styles.settingRowClickable}`}
        onClick={onOpenMapModal}
        role="button"
        tabIndex={0}
        aria-label={`Карты по умолчанию: ${PROVIDER_NAMES[defaultMapProvider]}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpenMapModal()
          }
        }}
      >
        <span className={styles.settingLabel}>Карты по умолчанию</span>
        <div className={styles.settingRight}>
          <span className={styles.settingValue}>{PROVIDER_NAMES[defaultMapProvider]}</span>
          <span className={styles.chevronIcon}>
            <IconChevronRight size={16} color="currentColor" />
          </span>
        </div>
      </div>

      {/* 3. Уведомления */}
      <div
        className={`${styles.settingRow} ${styles.settingRowClickable}`}
        onClick={onOpenNotificationsModal}
        role="button"
        tabIndex={0}
        aria-label="Настроить уведомления"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpenNotificationsModal()
          }
        }}
      >
        <span className={styles.settingLabel}>Уведомления</span>
        <div className={styles.settingRight}>
          <span className={styles.chevronIcon}>
            <IconChevronRight size={16} color="currentColor" />
          </span>
        </div>
      </div>
    </section>
  )
}
