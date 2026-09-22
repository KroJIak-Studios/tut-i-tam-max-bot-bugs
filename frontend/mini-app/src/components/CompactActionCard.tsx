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
    <button
      type="button"
      className={styles.compactCard}
      onClick={() => onClick?.(item.id)}
      aria-label={`${item.title}, ${item.subtitle}`}
    >
      <div
        className={`${styles.iconContainer} ${
          isGreen ? styles.themeGreen : styles.themePink
        }`}
      >
        {item.icon === 'location' ? (
          <IconLocationPinFilled size={16} color="#059669" />
        ) : (
          <IconHeart size={15} color="#E11D48" />
        )}
      </div>

      <div className={styles.textContent}>
        <div className={styles.titleRow}>
          <h4 className={styles.cardTitle}>{item.title}</h4>
          <span className={styles.arrowIcon} aria-hidden="true">
            <IconChevronRight size={12} />
          </span>
        </div>
        <p className={styles.cardSubtitle}>{item.subtitle}</p>
      </div>
    </button>
  )
}


