import React from 'react'
import { RefreshCw, AlertCircle, Calendar, Users, Eye, EyeOff, Ticket, Star, MapPin, Layers, Heart } from 'lucide-react'
import { useDashboardData } from './hooks/useDashboardData'
import { EventCompositionChart } from './components/EventCompositionChart'
import { useModerationCounts } from '../moderation/hooks/useModerationCounts'
import { citiesApi } from '../cities/api/citiesApi'
import { categoriesApi } from '../categories/api/categoriesApi'
import { interestsApi } from '../interests/api/interestsApi'
import styles from './Dashboard.module.css'

/** Compact summary stat card */
const StatCard: React.FC<{
  icon: React.ReactNode
  label: string
  value: number | string
  accentClass?: string
}> = ({ icon, label, value, accentClass }) => (
  <div className={`${styles.statCard} ${accentClass || ''}`}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statBody}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  </div>
)

/** Secondary operational metric row */
const OpMetric: React.FC<{
  icon: React.ReactNode
  label: string
  value: number | null
}> = ({ icon, label, value }) => {
  if (value === null) return null
  return (
    <div className={styles.opMetric}>
      <div className={styles.opMetricIcon}>{icon}</div>
      <span className={styles.opMetricLabel}>{label}</span>
      <span className={styles.opMetricValue}>{value.toLocaleString('ru-RU')}</span>
    </div>
  )
}

/** Directory count tile */
const DirTile: React.FC<{ icon: React.ReactNode; label: string; value: number | null }> = ({
  icon,
  label,
  value,
}) => (
  <div className={styles.dirTile}>
    <div className={styles.dirTileIcon}>{icon}</div>
    <div className={styles.dirTileValue}>
      {value === null ? '—' : value.toLocaleString('ru-RU')}
    </div>
    <div className={styles.dirTileLabel}>{label}</div>
  </div>
)

export const DashboardView: React.FC = () => {
  const { data, isLoading, error, refresh } = useDashboardData()
  const { counts: moderationCounts } = useModerationCounts()

  const [dirCounts, setDirCounts] = React.useState<{
    cities: number | null
    categories: number | null
    interests: number | null
  }>({ cities: null, categories: null, interests: null })

  React.useEffect(() => {
    Promise.allSettled([
      citiesApi.listCities(),
      categoriesApi.getCategories(),
      interestsApi.getInterests(),
    ]).then(([c, cat, int]) => {
      setDirCounts({
        cities: c.status === 'fulfilled' ? c.value.length : null,
        categories: cat.status === 'fulfilled' ? cat.value.length : null,
        interests: int.status === 'fulfilled' ? int.value.length : null,
      })
    })
  }, [])

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.title}>Дашборд</h1>
          <p className={styles.subtitle}>Сводные показатели платформы</p>
        </div>
      </header>

      {/* Error banner (when we already have data but re-fetch failed) */}
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

      {/* Loading state */}
      {isLoading && !data && (
        <div className={styles.stateCard}>
          <div className={styles.spinner} />
          <span className={styles.stateText}>Загрузка показателей платформы...</span>
        </div>
      )}

      {/* Error state (no data) */}
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
        <>
          {/* 1. Summary row — total events + users */}
          <section className={styles.summaryRow} aria-label="Сводные показатели">
            <StatCard
              icon={<Calendar size={18} />}
              label="Всего мероприятий"
              value={data.events.total.toLocaleString('ru-RU')}
            />
            <StatCard
              icon={<Users size={18} />}
              label="Пользователей"
              value={data.users.total.toLocaleString('ru-RU')}
            />
          </section>

          {/* 2. Event composition chart */}
          <EventCompositionChart
            events={data.events}
            moderationCounts={moderationCounts}
          />

          {/* 3. Operational metrics */}
          {(data.events.visible !== null ||
            data.events.hidden !== null ||
            data.events.free !== null ||
            data.events.pushkin !== null) && (
            <section className={styles.opsSection} aria-label="Операционные метрики">
              <h4 className={styles.sectionTitle}>Операционные метрики</h4>
              <div className={styles.opsGrid}>
                <OpMetric
                  icon={<Eye size={14} />}
                  label="Видно в каталоге"
                  value={data.events.visible}
                />
                <OpMetric
                  icon={<EyeOff size={14} />}
                  label="Скрыто"
                  value={data.events.hidden}
                />
                <OpMetric
                  icon={<Ticket size={14} />}
                  label="Бесплатные"
                  value={data.events.free}
                />
                <OpMetric
                  icon={<Star size={14} />}
                  label="Пушкинская карта"
                  value={data.events.pushkin}
                />
              </div>
            </section>
          )}

          {/* 4. Directory counts */}
          <section className={styles.dirSection} aria-label="Справочники">
            <h4 className={styles.sectionTitle}>Справочники</h4>
            <div className={styles.dirGrid}>
              <DirTile
                icon={<MapPin size={16} />}
                label="Города"
                value={dirCounts.cities}
              />
              <DirTile
                icon={<Layers size={16} />}
                label="Категории"
                value={dirCounts.categories}
              />
              <DirTile
                icon={<Heart size={16} />}
                label="Интересы"
                value={dirCounts.interests}
              />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
