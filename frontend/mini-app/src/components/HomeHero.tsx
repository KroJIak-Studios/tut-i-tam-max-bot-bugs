import React from 'react'
import { IconChevronRight, IconLocationPinFilled } from './Icons'
import styles from './HomeHero.module.css'

interface HomeHeroProps {
  title?: string
  subtitle?: string
  imageUrl?: string
  alt?: string
  onClick?: () => void
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  title = 'Куда пойти рядом',
  subtitle = 'по интересам и где вы сейчас',
  imageUrl = '/home-kazan-hero.jpg',
  alt = 'Вид на Казанский Кремль и мечеть Кул-Шариф',
  onClick,
}) => {
  return (
    <button
      type="button"
      className={styles.heroCard}
      onClick={onClick}
      aria-label={`${title}, ${subtitle}`}
    >
      <div className={styles.imageLayer}>
        <img src={imageUrl} alt={alt} className={styles.heroImage} />
      </div>

      <div className={styles.contentLayer}>
        <div className={styles.textGroup}>
          <h2 className={styles.heroTitle}>{title}</h2>
          <div className={styles.subtitleRow}>
            <IconLocationPinFilled size={14} className={styles.locationIcon} />
            <span className={styles.heroSubtitle}>{subtitle}</span>
          </div>
        </div>

        <div className={styles.heroCta} aria-hidden="true">
          <span>Найти рядом</span>
          <IconChevronRight size={14} color="#FFFFFF" />
        </div>
      </div>
    </button>
  )
}

