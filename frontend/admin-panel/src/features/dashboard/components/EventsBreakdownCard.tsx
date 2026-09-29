import React from 'react'
import {
  Calendar,
  Building2,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lock,
} from 'lucide-react'
import type { EventsBreakdownData, MetricItem } from '../types'
import styles from './EventsBreakdownCard.module.css'

interface EventsBreakdownCardProps {
  metric: MetricItem<EventsBreakdownData>
}

export const EventsBreakdownCard: React.FC<EventsBreakdownCardProps> = ({
  metric,
}) => {
  const { status, data, error, notes, endpoint } = metric

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.titleGroup}>
          <div className={styles.iconWrapper} aria-hidden="true">
            <Calendar size={18} />
          </div>
          <h3 className={styles.cardTitle}>Мероприятия сервиса</h3>
        </div>

        {status === 'ready' && (
          <span className={`${styles.badge} ${styles.badgeReady}`}>
            <CheckCircle2 size={12} />
            API
          </span>
        )}
        {status === 'pending_backend' && (
          <span className={`${styles.badge} ${styles.badgeGap}`}>
            <AlertTriangle size={12} />
            API Gap
          </span>
        )}
        {status === 'unauthorized' && (
          <span className={`${styles.badge} ${styles.badgeGap}`}>
            <Lock size={12} />
            Auth
          </span>
        )}
        {status === 'error' && (
          <span className={`${styles.badge} ${styles.badgeError}`}>
            <XCircle size={12} />
            Ошибка
          </span>
        )}
      </header>

      <div className={styles.totalSection}>
        <div className={styles.totalValueRow}>
          <span className={styles.totalValue}>
            {status === 'ready' && data ? data.total.toLocaleString('ru-RU') : '—'}
          </span>
        </div>
        <span className={styles.totalLabel}>
          {status === 'ready'
            ? 'Всего мероприятий в платформе'
            : 'Общий объём каталога событий (ожидает эндпоинт)'}
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
            {status === 'ready' && data
              ? data.official.toLocaleString('ru-RU')
              : '—'}
          </div>
          <span className={styles.breakdownSubtext}>
            Официальные мероприятия организаций (OfficialEvent)
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
            {status === 'ready' && data
              ? data.userCreated.toLocaleString('ru-RU')
              : '—'}
          </div>
          <span className={styles.breakdownSubtext}>
            События, предложенные жителями (UserEvent)
          </span>
        </div>
      </div>

      <footer className={styles.cardFooter}>
        {endpoint && (
          <div className={styles.endpointRow}>
            <span>Эндпоинт:</span>
            <code>{endpoint}</code>
          </div>
        )}
        {status === 'pending_backend' && (
          <p className={styles.notes}>
            {notes ||
              'Для точного подсчёта и разделения событий на городские и пользовательские требуется серверный эндпоинт агрегированной статистики. Клиентский обход пагинации исключён во избежание нагрузки на сеть.'}
          </p>
        )}
        {status === 'unauthorized' && (
          <p className={styles.notes}>
            Необходима авторизация администратора с валидным ADMIN_PASSWORD для просмотра статистики.
          </p>
        )}
        {status === 'error' && error && (
          <p className={styles.notes} style={{ color: 'var(--color-danger)' }}>
            {error}
          </p>
        )}
      </footer>
    </article>
  )
}
