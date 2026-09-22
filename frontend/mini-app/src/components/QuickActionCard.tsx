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
      aria-label={`${item.title}, ${item.subtitle.replace('\n', ' ')}`}
    >
      <div
        className={`${styles.iconContainer} ${
          isPurple ? styles.themePurple : styles.themeOrange
        }`}
      >
        {item.icon === 'grid' ? (
          <IconGrid size={24} color="#FFFFFF" />
        ) : (
          <IconCalendar size={22} color="#FFFFFF" />
        )}
      </div>

      <div className={styles.textContent}>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        <p className={styles.cardSubtitle}>{item.subtitle}</p>
      </div>

      <div className={styles.arrowButton} aria-hidden="true">
        <IconChevronRight size={14} />
      </div>
    </button>
  )
}
