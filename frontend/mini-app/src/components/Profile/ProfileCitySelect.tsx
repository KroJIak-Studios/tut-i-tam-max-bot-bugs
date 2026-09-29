import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconLocationPinFilled, IconChevronDown, IconCheck } from '../Icons'
import styles from './ProfileCitySelect.module.css'

export interface ProfileCity { id: string; name: string }
interface ProfileCitySelectProps { currentCity: ProfileCity | null; cities: ProfileCity[]; onSelectCity?: (city: ProfileCity) => void }
export const ProfileCitySelect: React.FC<ProfileCitySelectProps> = ({ currentCity, cities, onSelectCity }) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  if (cities.length === 0) return null
  return <section className={styles.card} aria-label={t('profile.city')}>
    <div className={styles.headerRow} onClick={() => setIsOpen((v) => !v)} role="button" tabIndex={0} aria-expanded={isOpen}><div className={styles.leftCol}><div className={styles.iconTile} aria-hidden="true"><IconLocationPinFilled size={18} color="#2563EB" /></div><span className={styles.label}>{t('profile.city')}</span></div><div className={styles.cityPill}><span className={styles.cityName}>{currentCity?.name || t('profile.chooseCity')}</span><span className={`${styles.chevronWrapper} ${isOpen ? styles.chevronOpen : ''}`}><IconChevronDown size={14} color="#64748B" /></span></div></div>
    {isOpen && <div className={styles.dropdownArea}><div className={styles.citiesList}>{cities.map((city) => <button key={city.id} type="button" className={`${styles.cityOption} ${currentCity?.id === city.id ? styles.cityOptionSelected : ''}`} onClick={() => { onSelectCity?.(city); setIsOpen(false) }}><span className={styles.optionName}>{city.name}</span>{currentCity?.id === city.id && <IconCheck size={16} color="#2563EB" className={styles.checkIcon} />}</button>)}</div></div>}
  </section>
}
