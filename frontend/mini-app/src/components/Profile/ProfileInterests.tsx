import React from 'react'
import { useTranslation } from 'react-i18next'
import { IconChevronRight } from '../Icons'
import styles from './ProfileInterests.module.css'

interface ProfileInterestsProps {
  interests: string[]
  onEditInterests: () => void
}

const getInterestColorStyle = (interest: string): React.CSSProperties => {
  const norm = interest.toLowerCase().trim()
  if (norm === 'walks' || norm === 'parks' || norm.includes('прогулк') || norm.includes('парк')) {
    return { backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#047857', borderColor: 'rgba(16, 185, 129, 0.2)' }
  }
  if (norm === 'museums' || norm === 'theatres' || norm === 'lectures' || norm.includes('музе') || norm.includes('театр') || norm.includes('лекци')) {
    return { backgroundColor: 'rgba(99, 102, 241, 0.08)', color: '#4338CA', borderColor: 'rgba(99, 102, 241, 0.2)' }
  }
  if (norm === 'sport' || norm.includes('спорт')) {
    return { backgroundColor: 'rgba(245, 158, 11, 0.09)', color: '#B45309', borderColor: 'rgba(245, 158, 11, 0.22)' }
  }
  if (norm === 'volunteering' || norm === 'boardgames' || norm.includes('волонтёр') || norm.includes('настолк')) {
    return { backgroundColor: 'rgba(37, 99, 235, 0.08)', color: '#1D4ED8', borderColor: 'rgba(37, 99, 235, 0.2)' }
  }
  if (norm === 'concerts' || norm === 'cinema' || norm === 'festivals' || norm.includes('концерт') || norm.includes('кино') || norm.includes('фестивал')) {
    return { backgroundColor: 'rgba(168, 85, 247, 0.08)', color: '#7E22CE', borderColor: 'rgba(168, 85, 247, 0.2)' }
  }
  if (norm === 'food' || norm.includes('гастроном')) {
    return { backgroundColor: 'rgba(244, 63, 94, 0.08)', color: '#BE123C', borderColor: 'rgba(244, 63, 94, 0.2)' }
  }
  return { backgroundColor: 'rgba(100, 116, 139, 0.08)', color: '#334155', borderColor: 'rgba(100, 116, 139, 0.2)' }
}

const getInterestLabel = (interest: string, t: (key: string, opts?: { defaultValue?: string }) => string): string => {
  return t(`interests.${interest}`, { defaultValue: interest })
}

export const ProfileInterests: React.FC<ProfileInterestsProps> = ({
  interests,
  onEditInterests,
}) => {
  const { t } = useTranslation()

  return (
    <section className={styles.card} aria-labelledby="interests-title">
      <div className={styles.headerRow}>
        <div className={styles.headerTitles}>
          <h3 id="interests-title" className={styles.title}>
            {t('profile.interests')}
          </h3>
          <span className={styles.subtitle}>{t('profile.interestsSubtitle')}</span>
        </div>
        <button
          type="button"
          className={styles.editBtn}
          onClick={onEditInterests}
          aria-label={t('profile.editInterests')}
        >
          <span>{t('common.edit')}</span>
          <IconChevronRight size={14} color="currentColor" />
        </button>
      </div>

      <div className={styles.chipsList} role="list">
        {interests.map((interest) => (
          <div
            key={interest}
            className={styles.chip}
            role="listitem"
            style={getInterestColorStyle(interest)}
          >
            {getInterestLabel(interest, t)}
          </div>
        ))}
      </div>
    </section>
  )
}
