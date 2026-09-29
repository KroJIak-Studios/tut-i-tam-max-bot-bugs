import React from 'react'
import { useTranslation } from 'react-i18next'
import { PersonAvatar } from '../PersonAvatar'
import styles from './ProfileHero.module.css'

interface ProfileHeroProps { firstName?: string | null; lastName?: string | null; avatarUrl: string | null }
export const ProfileHero: React.FC<ProfileHeroProps> = ({ firstName, lastName, avatarUrl }) => {
  const { t } = useTranslation()
  const name = [firstName, lastName].filter(Boolean).join(' ')
  return <section className={styles.heroCard} aria-label={t('profile.heroAriaLabel')}>
    <div className={styles.avatarContainer}>
      <PersonAvatar firstName={firstName} lastName={lastName} imageUrl={avatarUrl} className={styles.avatarFrame} />
    </div>
    {name && <h2 className={styles.name}>{name}</h2>}
  </section>
}