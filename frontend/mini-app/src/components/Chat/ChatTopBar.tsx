import React from 'react'
import styles from './ChatTopBar.module.css'

export const ChatTopBar: React.FC = () => {
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
        <h1 className={styles.pageTitle}>Чат</h1>
      </div>
    </header>
  )
}
