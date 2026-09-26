import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './ProfileHero.module.css'

interface ProfileHeroProps {
  name: string
  avatarUrl: string
  city?: string
  onEditProfile?: () => void
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  name,
  avatarUrl,
}) => {
  const { t } = useTranslation()

  return (
    <section className={styles.heroCard} aria-label={t('profile.heroAriaLabel')}>
      <div className={styles.avatarContainer}>
        <img
          src={avatarUrl}
          alt={name}
          className={styles.avatarImage}
        />
      </div>

      <h2 className={styles.name}>{name}</h2>
    </section>
  )
}
