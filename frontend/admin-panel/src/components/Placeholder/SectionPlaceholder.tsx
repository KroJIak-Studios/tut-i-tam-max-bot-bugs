import React from 'react'
import styles from './SectionPlaceholder.module.css'

export interface SectionPlaceholderProps {
  title: string
  description: string
  apiStatus: 'ready' | 'pending_backend'
  endpoints: string[]
  notes: string
}

export const SectionPlaceholder: React.FC<SectionPlaceholderProps> = ({
  title,
  description,
  apiStatus,
  endpoints,
  notes,
}) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          <span
            className={`${styles.statusBadge} ${
              apiStatus === 'ready' ? styles.statusReady : styles.statusPending
            }`}
          >
            {apiStatus === 'ready' ? 'API готов' : 'Ожидает Backend'}
          </span>
        </div>
        <p className={styles.description}>{description}</p>
      </header>

      <div className={styles.card}>
        <h2 className={styles.sectionHeading}>Связанные API эндпоинты</h2>
        <ul className={styles.detailsList}>
          {endpoints.map((ep) => (
            <li key={ep} className={styles.detailItem}>
              <span className={styles.detailDot} />
              <code className={styles.codeBadge}>{ep}</code>
            </li>
          ))}
        </ul>

        <h2 className={styles.sectionHeading}>Статус реализации</h2>
        <p className={styles.description}>{notes}</p>
      </div>
    </div>
  )
}
