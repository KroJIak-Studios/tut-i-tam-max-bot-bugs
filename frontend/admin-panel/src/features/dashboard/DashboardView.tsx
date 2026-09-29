import React from 'react'
import {
  RefreshCw,
  Layers,
  MapPin,
  Heart,
  Globe,
  LayoutDashboard,
  Clock,
} from 'lucide-react'
import { useDashboardData } from './hooks/useDashboardData'
import { EventsBreakdownCard } from './components/EventsBreakdownCard'
import { UsersMetricCard } from './components/UsersMetricCard'
import { TaxonomyCard } from './components/TaxonomyCard'
import { BackendGapNotice } from './components/BackendGapNotice'
import { QuickNavigationSection } from './components/QuickNavigationSection'
import styles from './Dashboard.module.css'

export const DashboardView: React.FC = () => {
  const {
    events,
    users,
    categories,
    cities,
    interests,
    locales,
    isLoading,
    isRefreshing,
    lastUpdated,
    refresh,
  } = useDashboardData()

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
            Операционные показатели сервиса городских мероприятий, состояние каталога и таксономии
          </p>
        </div>

        <div className={styles.headerActions}>
          {formattedTime && (
            <span className={styles.lastUpdatedText}>
              <Clock size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
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

      {/* Primary Metrics Grid */}
      <section className={styles.section} aria-labelledby="primary-metrics-title">
        <div className={styles.sectionHeader}>
          <h2 id="primary-metrics-title" className={styles.sectionTitle}>
            <LayoutDashboard size={18} />
            Ключевые продуктовые показатели
          </h2>
          <span className={styles.sectionSubtitle}>
            Агрегированная статистика каталога и аудитории
          </span>
        </div>

        <div className={styles.primaryGrid}>
          <EventsBreakdownCard metric={events} />
          <UsersMetricCard metric={users} />
        </div>
      </section>

      {/* Taxonomy & References Section */}
      <section className={styles.section} aria-labelledby="taxonomy-title">
        <div className={styles.sectionHeader}>
          <h2 id="taxonomy-title" className={styles.sectionTitle}>
            <Layers size={18} />
            Справочники и таксономия платформы
          </h2>
          <span className={styles.sectionSubtitle}>
            Активные классификаторы и географическая зона сервиса
          </span>
        </div>

        <div className={styles.taxonomyGrid}>
          <TaxonomyCard
            title="Категории"
            icon={<Layers size={16} />}
            unit="кат."
            metric={categories}
            linkTo="/categories"
            linkLabel="Категории"
          />

          <TaxonomyCard
            title="Города"
            icon={<MapPin size={16} />}
            unit="гор."
            metric={cities}
            linkTo="/cities"
            linkLabel="Города"
          />

          <TaxonomyCard
            title="Интересы"
            icon={<Heart size={16} />}
            unit="мет."
            metric={interests}
            linkTo="/interests"
            linkLabel="Интересы"
          />

          <TaxonomyCard
            title="Языки платформы"
            icon={<Globe size={16} />}
            unit="лок."
            metric={locales}
          />
        </div>
      </section>

      {/* Integration Notice & Architecture */}
      <BackendGapNotice />

      {/* Quick Navigation */}
      <QuickNavigationSection />
    </div>
  )
}
