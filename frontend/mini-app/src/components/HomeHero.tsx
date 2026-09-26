import React from 'react'
import { useTranslation } from 'react-i18next'
import { IconChevronRight } from './Icons'
import styles from './HomeHero.module.css'

interface HomeHeroProps {
  title?: string
  imageUrl?: string
  alt?: string
  onClick?: () => void
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  title,
  imageUrl = '/home-kazan-hero.jpg',
  alt,
  onClick,
}) => {
  const { t } = useTranslation()
  const heroTitle = title || t('home.heroTitle')
  const heroAlt = alt || t('home.heroImageAlt')

  return (
    <button
      type="button"
      className={styles.heroCard}
      onClick={onClick}
      aria-label={heroTitle}
    >
      <div className={styles.imageLayer}>
        <img src={imageUrl} alt={heroAlt} className={styles.heroImage} />
      </div>

      <div className={styles.contentLayer}>
        <h2 className={styles.heroTitle}>{heroTitle}</h2>

        <div className={styles.heroCta} aria-hidden="true">
          <span>{t('home.heroCta')}</span>
          <IconChevronRight size={14} color="#FFFFFF" />
        </div>
      </div>
    </button>
  )
}

