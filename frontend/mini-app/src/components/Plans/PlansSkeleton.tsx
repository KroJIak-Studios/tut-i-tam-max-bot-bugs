import React from 'react'
import styles from './PlansSkeleton.module.css'

export const PlansSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonList} aria-label="Загрузка планов">
      {[1, 2, 3].map((idx) => (
        <div key={idx} className={styles.skeletonCard}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonLineLong} />
            <div className={styles.skeletonLineShort} />
            <div className={styles.skeletonLineTiny} />
          </div>
          <div className={styles.skeletonBadge} />
        </div>
      ))}
    </div>
  )
}
