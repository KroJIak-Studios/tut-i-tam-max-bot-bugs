import React from 'react'
import { Calendar, Building2, UserCheck } from 'lucide-react'
import type { EventsStats } from '../types'
import styles from './EventsBreakdownCard.module.css'

interface EventsBreakdownCardProps {
  stats: EventsStats
}

export const EventsBreakdownCard: React.FC<EventsBreakdownCardProps> = ({ stats }) => {
  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <Calendar size={18} />
        </div>
        <h3 className={styles.cardTitle}>Мероприятия сервиса</h3>
      </header>

      <div className={styles.totalSection}>
        <span className={styles.totalValue}>
          {stats.total.toLocaleString('ru-RU')}
        </span>
        <span className={styles.totalLabel}>
          Всего мероприятий в платформе
        </span>
      </div>

      <div className={styles.breakdownGrid}>
        <div className={styles.breakdownItem}>
          <div className={styles.breakdownHeader}>
            <Building2
              size={14}
              className={styles.breakdownIconOfficial}
              aria-hidden="true"
            />
            <span>Городские события</span>
          </div>
          <div className={styles.breakdownValue}>
            {stats.official.toLocaleString('ru-RU')}
          </div>
          <span className={styles.breakdownSubtext}>
            Официальные мероприятия организаций
          </span>
        </div>

        <div className={styles.breakdownItem}>
          <div className={styles.breakdownHeader}>
            <UserCheck
              size={14}
              className={styles.breakdownIconUser}
              aria-hidden="true"
            />
            <span>Пользовательские</span>
          </div>
          <div className={styles.breakdownValue}>
            {stats.userCreated.toLocaleString('ru-RU')}
          </div>
          <span className={styles.breakdownSubtext}>
            События, предложенные жителями
          </span>
        </div>
      </div>
    </article>
  )
}
