import React from 'react'
import { RefreshCw, Clock, AlertCircle } from 'lucide-react'
import { useDashboardData } from './hooks/useDashboardData'
import { EventsBreakdownCard } from './components/EventsBreakdownCard'
import { UsersMetricCard } from './components/UsersMetricCard'
import styles from './Dashboard.module.css'

export const DashboardView: React.FC = () => {
  const { data, isLoading, isRefreshing, error, lastUpdated, refresh } =
    useDashboardData()

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.title}>Дашборд и сводные метрики</h1>
          <p className={styles.subtitle}>
            Операционные показатели платформы, статистика мероприятий и пользователей
          </p>
        </div>

        <div className={styles.headerActions}>
          {formattedTime && (
            <span className={styles.lastUpdatedText}>
              <Clock
                size={12}
                style={{
                  display: 'inline',
                  marginRight: 4,
                  verticalAlign: 'middle',
                }}
              />
              Обновлено: {formattedTime}
            </span>
          )}

          <button
            type="button"
            className={styles.refreshBtn}
            onClick={refresh}
            disabled={isRefreshing || isLoading}
            aria-label="Обновить метрики дашборда"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? styles.refreshIconRotating : undefined}
            />
            <span>{isRefreshing ? 'Обновление...' : 'Обновить данные'}</span>
          </button>
        </div>
      </header>

      {/* Error banner if refresh failed while existing data is kept */}
      {error && data && (
        <div className={styles.errorBanner} role="alert">
          <div className={styles.errorBannerContent}>
            <AlertCircle size={16} />
            <span>Не удалось обновить показатели: {error}. Отображаются ранее полученные данные.</span>
          </div>
          <button type="button" className={styles.bannerRetryBtn} onClick={refresh}>
            <RefreshCw size={12} />
            <span>Повторить</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      {isLoading && !data && (
        <div className={styles.stateCard}>
          <div className={styles.spinner} />
          <span className={styles.stateText}>Загрузка показателей платформы...</span>
        </div>
      )}

      {error && !data && (
        <div className={styles.stateCard}>
          <AlertCircle size={28} style={{ color: 'var(--color-danger)' }} />
          <h3 className={styles.errorTitle}>Статистика временно недоступна</h3>
          <span className={styles.stateText}>{error}</span>
          <button type="button" className={styles.retryBtn} onClick={refresh}>
            <RefreshCw size={14} />
            <span>Повторить запрос</span>
          </button>
        </div>
      )}

      {data && (
        <div className={styles.primaryGrid}>
          <EventsBreakdownCard stats={data.events} />
          <UsersMetricCard stats={data.users} />
        </div>
      )}
    </div>
  )
}
