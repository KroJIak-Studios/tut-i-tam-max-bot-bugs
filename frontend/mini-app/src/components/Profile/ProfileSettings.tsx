import React from 'react'
import type { MapProvider } from '../../types'
import { IconChevronRight, IconGlobe, IconBell } from '../Icons'
import styles from './ProfileSettings.module.css'

interface ProfileSettingsProps {
  pushkinCard?: boolean
  defaultMapProvider: MapProvider
  onTogglePushkinCard?: () => void
  onOpenMapModal: () => void
  onOpenNotificationsModal: () => void
}

const PROVIDER_NAMES: Record<MapProvider, string> = {
  yandex: 'Яндекс Карты',
  '2gis': '2ГИС',
  system: 'Системные карты',
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  defaultMapProvider,
  onOpenMapModal,
  onOpenNotificationsModal,
}) => {
  return (
    <section className={styles.card} aria-label="Настройки">

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
        <div className={styles.settingLeft}>
          <div className={`${styles.iconTile} ${styles.tileBlue}`} aria-hidden="true">
            <IconGlobe size={17} color="#2563EB" />
          </div>
          <div className={styles.settingText}>
            <span className={styles.settingTitle}>Карты по умолчанию</span>
            <span className={styles.settingSubtitle}>{PROVIDER_NAMES[defaultMapProvider]}</span>
          </div>
        </div>
        <div className={styles.chevronIcon}>
          <IconChevronRight size={18} color="#9CA3AF" />
        </div>
      </div>

      {/* 3. Уведомления */}
      <div
        className={`${styles.settingRow} ${styles.settingRowClickable}`}
        onClick={onOpenNotificationsModal}
        role="button"
        tabIndex={0}
        aria-label="Настроить уведомления: События и рекомендации"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpenNotificationsModal()
          }
        }}
      >
        <div className={styles.settingLeft}>
          <div className={`${styles.iconTile} ${styles.tileOrange}`} aria-hidden="true">
            <IconBell size={17} color="#EA580C" />
          </div>
          <div className={styles.settingText}>
            <span className={styles.settingTitle}>Уведомления</span>
            <span className={styles.settingSubtitle}>События и рекомендации</span>
          </div>
        </div>
        <div className={styles.chevronIcon}>
          <IconChevronRight size={18} color="#9CA3AF" />
        </div>
      </div>
    </section>
  )
}
