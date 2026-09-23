import React from 'react'
import type { HomeActionItem, ActionIcon, ActionTheme } from '../types'
import {
  IconChevronRight,
  IconGrid,
  IconCalendar,
  IconLocationPinFilled,
  IconHeart,
} from './Icons'
import styles from './QuickActionCard.module.css'

interface QuickActionCardProps {
  item: HomeActionItem
  onClick?: (id: string) => void
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ item, onClick }) => {
  const getThemeClass = (theme: ActionTheme) => {
    switch (theme) {
      case 'purple':
        return styles.themePurple
      case 'orange':
        return styles.themeOrange
      case 'green':
        return styles.themeGreen
      case 'pink':
        return styles.themePink
      default:
        return styles.themePurple
    }
  }

  const renderIcon = (icon: ActionIcon) => {
    switch (icon) {
      case 'grid':
        return <IconGrid size={24} color="#FFFFFF" />
      case 'calendar':
        return <IconCalendar size={22} color="#FFFFFF" />
      case 'location':
        return <IconLocationPinFilled size={22} color="#FFFFFF" />
      case 'heart':
        return <IconHeart size={22} color="#FFFFFF" />
      default:
        return <IconGrid size={22} color="#FFFFFF" />
    }
  }

  return (
    <button
      type="button"
      className={styles.actionCard}
      onClick={() => onClick?.(item.id)}
      aria-label={`${item.title}, ${item.subtitle}`}
    >
      <div className={styles.topRow}>
        <div className={`${styles.iconContainer} ${getThemeClass(item.theme)}`}>
          {renderIcon(item.icon)}
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.textContent}>
          <h3 className={styles.cardTitle}>{item.title}</h3>
          <p className={styles.cardSubtitle}>{item.subtitle}</p>
        </div>
        <div className={styles.arrowIcon} aria-hidden="true">
          <IconChevronRight size={14} />
        </div>
      </div>
    </button>
  )
}

