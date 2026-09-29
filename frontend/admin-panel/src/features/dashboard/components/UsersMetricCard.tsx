import React from 'react'
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lock,
} from 'lucide-react'
import type { MetricItem, UsersMetricData } from '../types'
import styles from './UsersMetricCard.module.css'

interface UsersMetricCardProps {
  metric: MetricItem<UsersMetricData>
}

export const UsersMetricCard: React.FC<UsersMetricCardProps> = ({ metric }) => {
  const { status, data, error, notes, endpoint } = metric

  return (
    <article className={styles.card}>
      <div>
        <header className={styles.cardHeader}>
          <div className={styles.titleGroup}>
            <div className={styles.iconWrapper} aria-hidden="true">
              <Users size={18} />
            </div>
            <h3 className={styles.cardTitle}>Пользователи платформы</h3>
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

        <div className={styles.totalSection} style={{ marginTop: '16px' }}>
          <div className={styles.totalValueRow}>
            <span className={styles.totalValue}>
              {status === 'ready' && data
                ? data.total.toLocaleString('ru-RU')
                : '—'}
            </span>
          </div>
          <span className={styles.totalLabel}>
            {status === 'ready'
              ? 'Зарегистрированных пользователей (MaxUser)'
              : 'Общее число профилей в базе (ожидает эндпоинт)'}
          </span>
        </div>
      </div>

      <div className={styles.descriptionBox}>
        <span>
          Учётные записи сервиса создаются при авторизации через MAX/Telegram.
          Агрегированный счётчик необходим для отслеживания динамики охвата аудитории.
        </span>
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
              'В текущем API эндпоинт подсчёта пользователей отсутствует. Рекомендуется включение поля users.total в GET /api/admin/stats.'}
          </p>
        )}
        {status === 'unauthorized' && (
          <p className={styles.notes}>
            Требуется пароль администратора для доступа к аналитике.
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
