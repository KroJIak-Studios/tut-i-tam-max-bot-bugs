import React from 'react'
import { IconClose } from './Icons'
import styles from './Header.module.css'

interface HeaderProps {
  onClose?: () => void
  city?: string
  greeting?: string
}

export const Header: React.FC<HeaderProps> = ({
  onClose,
  city = 'Казань',
  greeting = 'Добрый вечер',
}) => {
  return (
    <header className={styles.headerWrapper}>
      <div className={styles.topBar}>
        <h1 className={styles.topTitle}>Рядом</h1>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Закрыть"
        >
          <IconClose size={20} />
        </button>
      </div>

      <div className={styles.greetingSection}>
        <div className={styles.greetingTitle}>{greeting}</div>
        <div className={styles.greetingSubtitle}>{city}</div>
      </div>
    </header>
  )
}
