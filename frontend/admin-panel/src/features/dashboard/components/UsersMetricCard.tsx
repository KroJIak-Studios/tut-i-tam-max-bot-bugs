import React from 'react'
import { Users } from 'lucide-react'
import type { UsersStats } from '../types'
import styles from './UsersMetricCard.module.css'

interface UsersMetricCardProps {
  stats: UsersStats
}

export const UsersMetricCard: React.FC<UsersMetricCardProps> = ({ stats }) => {
  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <Users size={18} />
        </div>
        <h3 className={styles.cardTitle}>Пользователи</h3>
      </header>

      <div className={styles.totalSection} style={{ marginTop: '16px' }}>
        <span className={styles.totalValue}>
          {stats.total.toLocaleString('ru-RU')}
        </span>
        <span className={styles.totalLabel}>
          Зарегистрировано в платформе
        </span>
      </div>
    </article>
  )
}
