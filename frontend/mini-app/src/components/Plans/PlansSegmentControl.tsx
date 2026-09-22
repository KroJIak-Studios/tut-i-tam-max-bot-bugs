import React from 'react'
import styles from './PlansSegmentControl.module.css'

export type PlansTab = 'going' | 'past'

interface PlansSegmentControlProps {
  activeTab: PlansTab
  onChange: (tab: PlansTab) => void
  goingCount?: number
  pastCount?: number
}

export const PlansSegmentControl: React.FC<PlansSegmentControlProps> = ({
  activeTab,
  onChange,
  goingCount,
  pastCount,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.pillTrack} role="tablist" aria-label="Разделы планов">
        {/* Animated sliding highlight */}
        <div
          className={`${styles.sliderIndicator} ${
            activeTab === 'past' ? styles.sliderIndicatorRight : styles.sliderIndicatorLeft
          }`}
          aria-hidden="true"
        />

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'going'}
          className={`${styles.tabBtn} ${activeTab === 'going' ? styles.tabBtnActive : ''}`}
          onClick={() => onChange('going')}
        >
          <span>Иду</span>
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
          <span>Были</span>
          {pastCount !== undefined && pastCount > 0 && (
            <span className={styles.tabBadge}>{pastCount}</span>
          )}
        </button>
      </div>
    </div>
  )
}
