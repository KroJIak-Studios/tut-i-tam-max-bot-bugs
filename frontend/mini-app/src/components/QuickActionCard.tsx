import React from 'react'
import { useTranslation } from 'react-i18next'
import type { HomeActionItem, ActionIcon, ActionTheme } from '../types'
import {
  IconChevronRight,
  IconGrid,
  IconCalendar,
  IconLocationPinFilled,
  IconHeart,
  IconPlus,
} from './Icons'
import styles from './QuickActionCard.module.css'

interface QuickActionCardProps {
  item: HomeActionItem
  onClick?: (id: string) => void
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ item, onClick }) => {
  const { t } = useTranslation()
  const cardTitle = t(`home.actions.${item.id}.title`, { defaultValue: item.title })
  const cardSubtitle = t(`home.actions.${item.id}.subtitle`, { defaultValue: item.subtitle })

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
      case 'plus':
        return <IconPlus size={22} color="#FFFFFF" />
      default:
        return <IconGrid size={22} color="#FFFFFF" />
    }
  }

  return (
    <button
      type="button"
      className={styles.actionCard}
      onClick={() => onClick?.(item.id)}
      aria-label={`${cardTitle}, ${cardSubtitle}`}
    >
      <div className={styles.topRow}>
        <div className={`${styles.iconContainer} ${getThemeClass(item.theme)}`}>
          {renderIcon(item.icon)}
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.textContent}>
          <h3 className={styles.cardTitle}>{cardTitle}</h3>
          <p className={styles.cardSubtitle}>{cardSubtitle}</p>
        </div>
        <div className={styles.arrowIcon} aria-hidden="true">
          <IconChevronRight size={14} />
        </div>
      </div>
    </button>
  )
}

