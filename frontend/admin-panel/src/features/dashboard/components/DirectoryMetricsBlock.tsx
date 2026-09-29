import React, { useEffect, useState } from 'react'
import { MapPin, Layers, Heart } from 'lucide-react'
import { citiesApi } from '../../cities/api/citiesApi'
import { categoriesApi } from '../../categories/api/categoriesApi'
import { interestsApi } from '../../interests/api/interestsApi'
import styles from './DirectoryMetricsBlock.module.css'

interface DirectoryCounts {
  cities: number | null
  categories: number | null
  interests: number | null
}

interface MetricItemProps {
  icon: React.ReactNode
  label: string
  value: number | null
}

const MetricItem: React.FC<MetricItemProps> = ({ icon, label, value }) => (
  <div className={styles.metricItem}>
    <div className={styles.metricIcon} aria-hidden="true">{icon}</div>
    <div className={styles.metricBody}>
      <span className={styles.metricValue}>
        {value === null ? '—' : value.toLocaleString('ru-RU')}
      </span>
      <span className={styles.metricLabel}>{label}</span>
    </div>
  </div>
)

export const DirectoryMetricsBlock: React.FC = () => {
  const [counts, setCounts] = useState<DirectoryCounts>({
    cities: null,
    categories: null,
    interests: null,
  })

  useEffect(() => {
    // Fetch all three in parallel; each failure is isolated
    Promise.allSettled([
      citiesApi.listCities(),
      categoriesApi.getCategories(),
      interestsApi.getInterests(),
    ]).then(([citiesResult, categoriesResult, interestsResult]) => {
      setCounts({
        cities: citiesResult.status === 'fulfilled' ? citiesResult.value.length : null,
        categories: categoriesResult.status === 'fulfilled' ? categoriesResult.value.length : null,
        interests: interestsResult.status === 'fulfilled' ? interestsResult.value.length : null,
      })
    })
  }, [])

  return (
    <section className={styles.block} aria-label="Справочники">
      <h4 className={styles.blockTitle}>Справочники</h4>
      <div className={styles.metricsRow}>
        <MetricItem
          icon={<MapPin size={15} />}
          label="Города"
          value={counts.cities}
        />
        <MetricItem
          icon={<Layers size={15} />}
          label="Категории"
          value={counts.categories}
        />
        <MetricItem
          icon={<Heart size={15} />}
          label="Интересы"
          value={counts.interests}
        />
      </div>
    </section>
  )
}
