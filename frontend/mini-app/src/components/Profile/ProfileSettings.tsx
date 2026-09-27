import React from 'react'
import { useTranslation } from 'react-i18next'
import type { MapProvider, SupportedLocaleCode } from '../../types'
import { SUPPORTED_LOCALES } from '../../i18n'
import { IconChevronRight, IconGlobe, IconBell, IconLanguage, IconClipboardList } from '../Icons'
import styles from './ProfileSettings.module.css'

interface ProfileSettingsProps {
  pushkinCard?: boolean
  defaultMapProvider: MapProvider
  currentLocale: SupportedLocaleCode
  requestsCount?: number
  onTogglePushkinCard?: () => void
  onOpenRequests: () => void
  onOpenMapModal: () => void
  onOpenNotificationsModal: () => void
  onOpenLanguageModal: () => void
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  defaultMapProvider,
  currentLocale,
  requestsCount = 0,
  onOpenRequests,
  onOpenMapModal,
  onOpenNotificationsModal,
  onOpenLanguageModal,
}) => {
  const { t } = useTranslation()

  const currentLocaleItem = SUPPORTED_LOCALES.find((l) => l.code === currentLocale)
  const currentLocaleLabel = currentLocaleItem ? currentLocaleItem.nativeName : 'Русский'

  const providerNames: Record<MapProvider, string> = {
    yandex: t('profile.yandexMaps'),
    '2gis': t('profile.gisMaps'),
    system: t('profile.systemMaps'),
  }

  return (
    <section className={styles.card} aria-label={t('profile.settings')}>
      {/* 1. Мои заявки */}
      <div
        className={`${styles.settingRow} ${styles.settingRowClickable}`}
        onClick={onOpenRequests}
        role="button"
        tabIndex={0}
        aria-label={`${t('profile.myRequests')}: ${requestsCount > 0 ? t('profile.requestsUnderReviewCount', { count: requestsCount }) : t('profile.myRequestsSubtitle')}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpenRequests()
          }
        }}
      >
        <div className={styles.settingLeft}>
          <div className={`${styles.iconTile} ${styles.tileTeal}`} aria-hidden="true">
            <IconClipboardList size={17} color="#059669" />
          </div>
          <div className={styles.settingText}>
            <span className={styles.settingTitle}>{t('profile.myRequests')}</span>
            <span className={styles.settingSubtitle}>
              {requestsCount > 0
                ? t('profile.requestsUnderReviewCount', { count: requestsCount })
                : t('profile.myRequestsSubtitle')}
            </span>
          </div>
        </div>
        <div className={styles.settingRight}>
          {requestsCount > 0 && (
            <span className={styles.countBadge} aria-hidden="true">
              {requestsCount}
            </span>
          )}
          <div className={styles.chevronIcon}>
            <IconChevronRight size={18} color="#9CA3AF" />
          </div>
        </div>
      </div>

      {/* 2. Язык приложения */}
      <div
        className={`${styles.settingRow} ${styles.settingRowClickable}`}
        onClick={onOpenLanguageModal}
        role="button"
        tabIndex={0}
        aria-label={`${t('profile.language')}: ${currentLocaleLabel}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpenLanguageModal()
          }
        }}
      >
        <div className={styles.settingLeft}>
          <div className={`${styles.iconTile} ${styles.tileViolet}`} aria-hidden="true">
            <IconLanguage size={17} color="#7C3AED" />
          </div>
          <div className={styles.settingText}>
            <span className={styles.settingTitle}>{t('profile.language')}</span>
            <span className={styles.settingSubtitle}>{currentLocaleLabel}</span>
          </div>
        </div>
        <div className={styles.chevronIcon}>
          <IconChevronRight size={18} color="#9CA3AF" />
        </div>
      </div>

      {/* 2. Карты по умолчанию */}
      <div
        className={`${styles.settingRow} ${styles.settingRowClickable}`}
        onClick={onOpenMapModal}
        role="button"
        tabIndex={0}
        aria-label={`${t('profile.defaultMaps')}: ${providerNames[defaultMapProvider]}`}
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
            <span className={styles.settingTitle}>{t('profile.defaultMaps')}</span>
            <span className={styles.settingSubtitle}>{providerNames[defaultMapProvider]}</span>
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
        aria-label={`${t('profile.notifications')}: ${t('profile.notificationsSubtitle')}`}
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
            <span className={styles.settingTitle}>{t('profile.notifications')}</span>
            <span className={styles.settingSubtitle}>{t('profile.notificationsSubtitle')}</span>
          </div>
        </div>
        <div className={styles.chevronIcon}>
          <IconChevronRight size={18} color="#9CA3AF" />
        </div>
      </div>
    </section>
  )
}
