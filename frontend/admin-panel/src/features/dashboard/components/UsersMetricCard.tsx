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
      <div>
        <header className={styles.cardHeader}>
          <div className={styles.iconWrapper} aria-hidden="true">
            <Users size={18} />
          </div>
          <h3 className={styles.cardTitle}>Пользователи платформы</h3>
        </header>

        <div className={styles.totalSection} style={{ marginTop: '16px' }}>
          <span className={styles.totalValue}>
            {stats.total.toLocaleString('ru-RU')}
          </span>
          <span className={styles.totalLabel}>
            Всего зарегистрированных пользователей
          </span>
        </div>
      </div>

      <div className={styles.descriptionBox}>
        <span>
          Аудитория сервиса, взаимодействующая с каталогом событий через Telegram Mini App и бота.
        </span>
      </div>
    </article>
  )
}
