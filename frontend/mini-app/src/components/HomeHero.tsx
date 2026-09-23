import React from 'react'
import { IconChevronRight } from './Icons'
import styles from './HomeHero.module.css'

interface HomeHeroProps {
  title?: string
  imageUrl?: string
  alt?: string
  onClick?: () => void
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  title = 'Куда пойти рядом',
  imageUrl = '/home-kazan-hero.jpg',
  alt = 'Вид на Казанский Кремль и мечеть Кул-Шариф',
  onClick,
}) => {
  return (
    <button
      type="button"
      className={styles.heroCard}
      onClick={onClick}
      aria-label={title}
    >
      <div className={styles.imageLayer}>
        <img src={imageUrl} alt={alt} className={styles.heroImage} />
      </div>

      <div className={styles.contentLayer}>
        <h2 className={styles.heroTitle}>{title}</h2>

        <div className={styles.heroCta} aria-hidden="true">
          <span>Найти рядом</span>
          <IconChevronRight size={14} color="#FFFFFF" />
        </div>
      </div>
    </button>
  )
}

