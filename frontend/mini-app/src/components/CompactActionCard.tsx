import React from 'react'
import type { CompactActionItem } from '../types'
import { IconChevronRight, IconLocationPinFilled, IconHeart } from './Icons'
import styles from './CompactActionCard.module.css'

interface CompactActionCardProps {
  item: CompactActionItem
  onClick?: (id: string) => void
}

export const CompactActionCard: React.FC<CompactActionCardProps> = ({ item, onClick }) => {
  const isGreen = item.theme === 'green'

  return (
    <div
      className={styles.compactCard}
      onClick={() => onClick?.(item.id)}
      role="button"
      tabIndex={0}
      aria-label={`${item.title}, ${item.subtitle}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(item.id)
        }
      }}
    >
      <div
        className={`${styles.iconContainer} ${
          isGreen ? styles.themeGreen : styles.themePink
        }`}
      >
        {item.icon === 'location' ? (
          <IconLocationPinFilled size={20} color="#10B981" />
        ) : (
          <IconHeart size={18} color="#EC4899" />
        )}
      </div>

      <div className={styles.textContent}>
        <h4 className={styles.cardTitle}>{item.title}</h4>
        <p className={styles.cardSubtitle}>{item.subtitle}</p>
      </div>

      <div className={styles.arrowButton} aria-hidden="true">
        <IconChevronRight size={13} />
      </div>
    </div>
  )
}
