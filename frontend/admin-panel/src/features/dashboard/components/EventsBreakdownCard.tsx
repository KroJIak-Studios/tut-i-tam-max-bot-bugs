import React from 'react'
import { Calendar, Building2, UserCheck, Eye, EyeOff, Ticket, Star } from 'lucide-react'
import type { EventsStats } from '../types'
import styles from './EventsBreakdownCard.module.css'

interface EventsBreakdownCardProps {
  stats: EventsStats
}

interface SecondaryMetricProps {
  icon: React.ReactNode
  label: string
  value: number | null
}

const SecondaryMetric: React.FC<SecondaryMetricProps> = ({ icon, label, value }) => {
  if (value === null) return null
  return (
    <div className={styles.secondaryItem}>
      <div className={styles.secondaryHeader}>
        {icon}
        <span>{label}</span>
      </div>
      <div className={styles.secondaryValue}>{value.toLocaleString('ru-RU')}</div>
    </div>
  )
}

export const EventsBreakdownCard: React.FC<EventsBreakdownCardProps> = ({ stats }) => {
  const hasSecondary =
    stats.visible !== null ||
    stats.hidden !== null ||
    stats.free !== null ||
    stats.pushkin !== null

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <Calendar size={18} />
        </div>
        <h3 className={styles.cardTitle}>Мероприятия</h3>
      </header>

      <div className={styles.totalSection}>
        <span className={styles.totalValue}>
          {stats.total.toLocaleString('ru-RU')}
        </span>
        <span className={styles.totalLabel}>Всего мероприятий</span>
      </div>

      {/* Primary breakdown: official / user-created */}
      <div className={styles.breakdownGrid}>
        <div className={styles.breakdownItem}>
          <div className={styles.breakdownHeader}>
            <Building2
              size={14}
              className={styles.breakdownIconOfficial}
              aria-hidden="true"
            />
            <span>Городские</span>
          </div>
          <div className={styles.breakdownValue}>
            {stats.official.toLocaleString('ru-RU')}
          </div>
          <span className={styles.breakdownSubtext}>Официальные организаций</span>
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
          <span className={styles.breakdownSubtext}>Предложены жителями</span>
        </div>
      </div>

      {/* Secondary breakdown: visible / hidden / free / pushkin */}
      {hasSecondary && (
        <div className={styles.secondaryGrid}>
          <SecondaryMetric
            icon={<Eye size={13} className={styles.iconVisible} aria-hidden="true" />}
            label="Видно в каталоге"
            value={stats.visible}
          />
          <SecondaryMetric
            icon={<EyeOff size={13} className={styles.iconHidden} aria-hidden="true" />}
            label="Скрыто"
            value={stats.hidden}
          />
          <SecondaryMetric
            icon={<Ticket size={13} className={styles.iconFree} aria-hidden="true" />}
            label="Бесплатные"
            value={stats.free}
          />
          <SecondaryMetric
            icon={<Star size={13} className={styles.iconPushkin} aria-hidden="true" />}
            label="Пушкинская карта"
            value={stats.pushkin}
          />
        </div>
      )}
    </article>
  )
}
