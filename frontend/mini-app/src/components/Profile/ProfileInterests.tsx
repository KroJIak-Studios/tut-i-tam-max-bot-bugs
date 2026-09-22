import React from 'react'
import styles from './ProfileInterests.module.css'

interface ProfileInterestsProps {
  interests: string[]
  onEditInterests: () => void
}

export const ProfileInterests: React.FC<ProfileInterestsProps> = ({
  interests,
  onEditInterests,
}) => {
  return (
    <section className={styles.card} aria-labelledby="interests-title">
      <div className={styles.headerRow}>
        <h3 id="interests-title" className={styles.title}>
          Интересы
        </h3>
        <button
          type="button"
          className={styles.editBtn}
          onClick={onEditInterests}
          aria-label="Изменить интересы"
        >
          Изменить
        </button>
      </div>

      <div className={styles.chipsList} role="list">
        {interests.map((interest) => (
          <div key={interest} className={styles.chip} role="listitem">
            {interest}
          </div>
        ))}
      </div>
    </section>
  )
}
