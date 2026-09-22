import React from 'react'
import styles from './Header.module.css'

interface HeaderProps {
  city?: string
  greeting?: string
}

export const Header: React.FC<HeaderProps> = ({
  city = 'Казань',
  greeting = 'Добрый вечер',
}) => {
  return (
    <header className={styles.headerWrapper}>
      <div className={styles.topBar}>
        <div className={styles.brandLockup}>
          <img
            src="/brand/tut-i-tam-logo-128.png"
            alt="Тут и Там"
            className={styles.brandLogo}
          />
          <h1 className={styles.topTitle}>Тут и Там</h1>
        </div>
      </div>

      <div className={styles.greetingSection}>
        <div className={styles.greetingTitle}>{greeting}</div>
        <div className={styles.greetingSubtitle}>{city}</div>
      </div>
    </header>
  )
}
