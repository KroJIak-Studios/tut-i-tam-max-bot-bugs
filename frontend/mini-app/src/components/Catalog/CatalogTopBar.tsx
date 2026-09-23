import React from 'react'
import styles from './CatalogTopBar.module.css'

export const CatalogTopBar: React.FC = () => {
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
        <h1 className={styles.pageTitle}>Каталог</h1>
      </div>
    </header>
  )
}
