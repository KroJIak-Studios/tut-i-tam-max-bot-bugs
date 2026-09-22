import React from 'react'
import styles from './MapTopBar.module.css'

export const MapTopBar: React.FC = () => {
  return (
    <header className={styles.topBarWrapper}>
      <div className={styles.topBar}>
        <h1 className={styles.topTitle}>Карта</h1>
      </div>
    </header>
  )
}
