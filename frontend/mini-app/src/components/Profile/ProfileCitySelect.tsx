import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconLocationPinFilled, IconChevronDown, IconCheck } from '../Icons'
import styles from './ProfileCitySelect.module.css'

interface ProfileCitySelectProps {
  currentCity: string
  onSelectCity?: (city: string) => void
}

const AVAILABLE_CITIES = [
  { id: 'kazan', available: true },
]

export const ProfileCitySelect: React.FC<ProfileCitySelectProps> = ({
  currentCity,
  onSelectCity,
}) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
  }

  const handleSelectCity = (cityId: string) => {
    onSelectCity?.(cityId)
    setIsOpen(false)
  }

  const normalizedCityId = currentCity.toLowerCase().trim() === 'казань' ? 'kazan' : currentCity.toLowerCase().trim()
  const displayCityName = normalizedCityId === 'kazan' ? t('cities.kazan') : currentCity

  return (
    <section className={styles.card} aria-label={t('profile.city')}>
      <div
        className={styles.headerRow}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls="city-select-dropdown"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggle()
          } else if (e.key === 'Escape' && isOpen) {
            setIsOpen(false)
          }
        }}
      >
        <div className={styles.leftCol}>
          <div className={styles.iconTile} aria-hidden="true">
            <IconLocationPinFilled size={18} color="#2563EB" />
          </div>
          <span className={styles.label}>{t('profile.city')}</span>
        </div>

        <div className={styles.cityPill}>
          <span className={styles.cityName}>{displayCityName}</span>
          <span
            className={`${styles.chevronWrapper} ${isOpen ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          >
            <IconChevronDown size={14} color="#64748B" />
          </span>
        </div>
      </div>

      {isOpen && (
        <div id="city-select-dropdown" className={styles.dropdownArea}>
          <div className={styles.citiesList}>
            {AVAILABLE_CITIES.map((city) => {
              const isSelected = normalizedCityId === city.id
              const cityName = t(`cities.${city.id}` as 'cities.kazan')
              return (
                <button
                  key={city.id}
                  type="button"
                  className={`${styles.cityOption} ${isSelected ? styles.cityOptionSelected : ''}`}
                  onClick={() => handleSelectCity(city.id)}
                >
                  <span className={styles.optionName}>{cityName}</span>
                  {isSelected && (
                    <IconCheck size={16} color="#2563EB" className={styles.checkIcon} />
                  )}
                </button>
              )
            })}
          </div>

          <div className={styles.noteRow}>
            <span className={styles.noteDot}>•</span>
            <span className={styles.noteText}>{t('profile.cityNotice')}</span>
          </div>
        </div>
      )}
    </section>
  )
}
