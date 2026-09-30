import React from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import type { EventsStatsSummary } from '../types'
import styles from './EventsHeader.module.css'

interface EventsHeaderProps {
  stats: EventsStatsSummary | null
  isLoading: boolean
  onRefresh: () => void
  onCreate: () => void
}

export const EventsHeader: React.FC<EventsHeaderProps> = ({
  stats,
  isLoading,
  onRefresh,
  onCreate,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Мероприятия</h1>
          <p className={styles.subtitle}>
            Управление городскими и пользовательскими событиями сервиса
          </p>
        </div>

        <div className={styles.actionsArea}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Обновить список мероприятий"
          >
            <RefreshCw
              size={16}
              className={isLoading ? styles.spinning : undefined}
              aria-hidden="true"
            />
            <span>Обновить</span>
          </button>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={onCreate}
          >
            <Plus size={16} aria-hidden="true" />
            <span>Создать мероприятие</span>
          </button>
        </div>
      </div>

      {stats && (
        <div className={styles.statsBar} aria-label="Сводная статистика мероприятий">
          <div className={styles.statPill}>
            <span>Всего в базе:</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.officialDot} aria-hidden="true" />
            <span>Официальных:</span>
            <span className={styles.statValue}>{stats.official}</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.userDot} aria-hidden="true" />
            <span>Пользовательских:</span>
            <span className={styles.statValue}>{stats.userCreated}</span>
          </div>
        </div>
      )}
    </header>
  )
}
