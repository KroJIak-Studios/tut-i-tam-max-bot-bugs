import React from 'react'
import { useTranslation } from 'react-i18next'
import type { AppMapProviderId, SupportedLocaleCode } from '../../types'
import { getAppMapProvider } from '../../services/mapProviders'
import { SUPPORTED_LOCALES } from '../../i18n'
import { IconBell, IconChevronRight, IconLanguage, IconMap, IconTrash } from '../Icons'
import styles from './ProfileSettings.module.css'

interface Props {
  appMapProvider: AppMapProviderId
  currentLocale: SupportedLocaleCode
  onOpenLanguageModal: () => void
  onOpenAppMapModal: () => void
  onOpenNotificationsModal: () => void
  onOpenDeleteDataModal: () => void
}

export const ProfileSettings: React.FC<Props> = ({ appMapProvider, currentLocale, onOpenLanguageModal, onOpenAppMapModal, onOpenNotificationsModal, onOpenDeleteDataModal }) => {
  const { t } = useTranslation()
  const locale = SUPPORTED_LOCALES.find((item) => item.code === currentLocale)
  const map = getAppMapProvider(appMapProvider)
  const row = (icon: React.ReactNode, title: string, subtitle: string, click: () => void) => <div className={`${styles.settingRow} ${styles.settingRowClickable}`} onClick={click} role="button" tabIndex={0}><div className={styles.settingLeft}><div className={styles.iconTile}>{icon}</div><div className={styles.settingText}><span className={styles.settingTitle}>{title}</span><span className={styles.settingSubtitle}>{subtitle}</span></div></div><div className={styles.chevronIcon}><IconChevronRight size={18} color="#9CA3AF" /></div></div>
  return <section className={styles.card} aria-label={t('profile.settings')}>
    {row(<IconLanguage size={17} color="#7C3AED" />, t('profile.language'), locale?.nativeName || 'Русский', onOpenLanguageModal)}
    {row(<IconMap size={17} color="#2563EB" />, t('profile.appMap'), t(map.nameKey), onOpenAppMapModal)}
    {row(<IconBell size={17} color="#EA580C" />, t('profile.notifications'), t('profile.notificationsSubtitle'), onOpenNotificationsModal)}
    {row(<IconTrash size={17} color="#DC2626" />, t('profile.deleteData'), t('profile.deleteDataSubtitle'), onOpenDeleteDataModal)}
  </section>
}
