import React from 'react'
import { useTranslation } from 'react-i18next'
import { IconChevronRight } from './Icons'
import styles from './HomeHero.module.css'

interface HomeHeroProps {
  title?: string
  onClick?: () => void
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  title,
  onClick,
}) => {
  const { t } = useTranslation()
  const heroTitle = title || t('home.heroTitle')

  return (
    <button
      type="button"
      className={styles.heroCard}
      onClick={onClick}
      aria-label={heroTitle}
    >
      <div className={styles.imageLayer}>
        <img
          src="/home-kazan-hero.webp"
          alt=""
          className={styles.heroImage}
          width={800}
          height={446}
          decoding="sync"
          fetchPriority="high"
        />
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

