import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './PlansSegmentControl.module.css'

export type PlansTab = 'going' | 'past' | 'requests'

interface PlansSegmentControlProps {
  activeTab: PlansTab
  onChange: (tab: PlansTab) => void
  goingCount?: number
  pastCount?: number
  requestsCount?: number
}

export const PlansSegmentControl: React.FC<PlansSegmentControlProps> = ({
  activeTab,
  onChange,
  goingCount,
  pastCount,
  requestsCount,
}) => {
  const { t } = useTranslation()

  return (
    <div className={styles.container}>
      <div className={styles.pillTrack} role="tablist" aria-label={t('plans.sectionsAriaLabel')}>
        {/* Animated sliding highlight */}
        <div
          className={styles.sliderIndicator}
          style={{ transform: `translateX(${activeTab === 'past' ? '100%' : activeTab === 'requests' ? '200%' : '0'})` }}
          aria-hidden="true"
        />

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'going'}
          className={`${styles.tabBtn} ${activeTab === 'going' ? styles.tabBtnActive : ''}`}
          onClick={() => onChange('going')}
        >
          <span>{t('plans.tabs.going')}</span>
          {goingCount !== undefined && goingCount > 0 && (
            <span className={styles.tabBadge}>{goingCount}</span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'past'}
          className={`${styles.tabBtn} ${activeTab === 'past' ? styles.tabBtnActive : ''}`}
          onClick={() => onChange('past')}
        >
          <span>{t('plans.tabs.past')}</span>
          {pastCount !== undefined && pastCount > 0 && (
            <span className={styles.tabBadge}>{pastCount}</span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'requests'}
          className={`${styles.tabBtn} ${activeTab === 'requests' ? styles.tabBtnActive : ''}`}
          onClick={() => onChange('requests')}
        >
          <span>{t('plans.tabs.requests')}</span>
          {requestsCount !== undefined && requestsCount > 0 && (
            <span className={styles.tabBadge}>{requestsCount}</span>
          )}
        </button>
      </div>
    </div>
  )
}
