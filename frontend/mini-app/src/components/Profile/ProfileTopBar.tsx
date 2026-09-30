import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './ProfileTopBar.module.css'

export const ProfileTopBar: React.FC = () => {
  const { t } = useTranslation()
  return (
    <header className={styles.topBarWrapper}>
      <div className={styles.topBar}>
        <div className={styles.brandLockup}>
          <img
            src="/brand/tut-i-tam-logo-128.png"
            alt=""
            className={styles.brandLogo}
          />
          <span className={styles.brandTitle}>{t('app.name')}</span>
        </div>
        <h1 className={styles.pageTitle}>{t('profile.title')}</h1>
      </div>
    </header>
  )
}
