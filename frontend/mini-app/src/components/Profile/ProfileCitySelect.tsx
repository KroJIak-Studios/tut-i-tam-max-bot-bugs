import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconLocationPinFilled, IconChevronDown, IconCheck } from '../Icons'
import styles from './ProfileCitySelect.module.css'

interface ProfileCitySelectProps {
  currentCity: string
  onSelectCity?: (city: string) => void
}

const AVAILABLE_CITIES = [
  { id: 'kazan', name: 'Казань', available: true },
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

  const handleSelectCity = (cityName: string) => {
    onSelectCity?.(cityName)
    setIsOpen(false)
  }

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
          <span className={styles.cityName}>{currentCity}</span>
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
              const isSelected = city.name === currentCity
              return (
                <button
                  key={city.id}
                  type="button"
                  className={`${styles.cityOption} ${isSelected ? styles.cityOptionSelected : ''}`}
                  onClick={() => handleSelectCity(city.name)}
                >
                  <span className={styles.optionName}>{city.name}</span>
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
