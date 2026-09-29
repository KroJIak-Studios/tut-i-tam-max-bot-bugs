import React from 'react'
import { useTranslation } from 'react-i18next'
import { IconChevronRight } from '../Icons'
import styles from './ProfileInterests.module.css'

interface ProfileInterestsProps {
  interests: { id: string; name: string; color: string }[]
  onEditInterests: () => void
}

export const ProfileInterests: React.FC<ProfileInterestsProps> = ({ interests, onEditInterests }) => {
  const { t } = useTranslation()
  return <section className={styles.card} aria-labelledby="interests-title">
    <div className={styles.headerRow}><div className={styles.headerTitles}><h3 id="interests-title" className={styles.title}>{t('profile.interests')}</h3><span className={styles.subtitle}>{t('profile.interestsSubtitle')}</span></div><button type="button" className={styles.editBtn} onClick={onEditInterests} aria-label={t('profile.editInterests')}><span>{t('common.edit')}</span><IconChevronRight size={14} color="currentColor" /></button></div>
    <div className={styles.chipsList} role="list">{interests.map((interest) => <div key={interest.id} className={styles.chip} role="listitem" style={{ backgroundColor: `${interest.color}18`, color: interest.color, borderColor: `${interest.color}44` }}>{interest.name}</div>)}</div>
  </section>
}
