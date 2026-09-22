import React from 'react'
import type { QuickActionItem } from '../types'
import { IconChevronRight, IconGrid, IconCalendar } from './Icons'
import styles from './QuickActionCard.module.css'

interface QuickActionCardProps {
  item: QuickActionItem
  onClick?: (id: string) => void
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ item, onClick }) => {
  const isPurple = item.theme === 'purple'

  return (
    <button
      type="button"
      className={styles.actionCard}
      onClick={() => onClick?.(item.id)}
      aria-label={`${item.title}, ${item.subtitle}`}
    >
      <div className={styles.topRow}>
        <div
          className={`${styles.iconContainer} ${
            isPurple ? styles.themePurple : styles.themeOrange
          }`}
        >
          {item.icon === 'grid' ? (
            <IconGrid size={20} color="#FFFFFF" />
          ) : (
            <IconCalendar size={18} color="#FFFFFF" />
          )}
        </div>
        <div className={styles.arrowIcon} aria-hidden="true">
          <IconChevronRight size={13} color="#94A3B8" />
        </div>
      </div>

      <div className={styles.textContent}>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        <p className={styles.cardSubtitle}>{item.subtitle}</p>
      </div>
    </button>
  )
}

