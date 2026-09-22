import React from 'react'
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
    <div className={styles.heroWrapper}>
      <div className={styles.avatarContainer}>
        <img
          src={avatarUrl}
          alt={name}
          className={styles.avatarImage}
        />
      </div>

      <h2 className={styles.name}>{name}</h2>
      <div className={styles.city}>{city}</div>

      <button
        type="button"
        className={styles.editBtn}
        onClick={onEditProfile}
        aria-label="Изменить имя и город"
      >
        <span>Изменить профиль</span>
      </button>
    </div>
  )
}
