import React from 'react'
import { IconLocationPin, IconPencil } from '../Icons'
import styles from './ProfileHero.module.css'

interface ProfileHeroProps {
  name: string
  city: string
  avatarUrl: string
  onEditProfile: () => void
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  name,
  city,
  avatarUrl,
  onEditProfile,
}) => {
  return (
    <section className={styles.heroCard} aria-label="Карточка профиля">
      <div className={styles.avatarContainer}>
        <img
          src={avatarUrl}
          alt={name}
          className={styles.avatarImage}
        />
      </div>

      <h2 className={styles.name}>{name}</h2>

      <div className={styles.cityRow}>
        <IconLocationPin size={13} color="#9CA3AF" />
        <span className={styles.cityText}>{city}</span>
      </div>

      <button
        type="button"
        className={styles.editBtn}
        onClick={onEditProfile}
        aria-label="Изменить имя и город"
      >
        <IconPencil size={13} color="#4B5563" />
        <span>Изменить профиль</span>
      </button>
    </section>
  )
}
