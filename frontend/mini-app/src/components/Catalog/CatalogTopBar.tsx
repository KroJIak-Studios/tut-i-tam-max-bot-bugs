import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './CatalogTopBar.module.css'

export const CatalogTopBar: React.FC = () => {
  const { t } = useTranslation()

  return (
    <header className={styles.topBarWrapper}>
      <div className={styles.topBar}>
        <div className={styles.brandLockup}>
          <img
            src="/brand/tut-i-tam-logo-128.png"
            alt="Тут и Там"
            className={styles.brandLogo}
          />
          <span className={styles.brandTitle}>Тут и Там</span>
        </div>
        <h1 className={styles.pageTitle}>{t('catalog.title')}</h1>
      </div>
    </header>
  )
}
