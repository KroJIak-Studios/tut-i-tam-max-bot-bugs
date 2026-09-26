import React from 'react'
import { useTranslation } from 'react-i18next'
import { getGreetingKey } from '../utils/dateUtils'
import { IconLocationPinFilled } from './Icons'
import styles from './Header.module.css'

interface HeaderProps {
  city?: string
  greeting?: string
}

export const Header: React.FC<HeaderProps> = ({
  city = 'kazan',
  greeting,
}) => {
  const { t } = useTranslation()
  const greetingKey = getGreetingKey()
  const currentGreeting = greeting || t(`home.greetings.${greetingKey}`)

  const normalizedCity = city.toLowerCase().trim()
  const displayCity =
    normalizedCity === 'kazan' || normalizedCity === 'казань'
      ? t('cities.kazan')
      : city

  return (
    <header className={styles.headerWrapper}>
      <div className={styles.topBar}>
        <div className={styles.brandLockup}>
          <img
            src="/brand/tut-i-tam-logo-128.png"
            alt="Тут и Там"
            className={styles.brandLogo}
          />
          <h1 className={styles.topTitle}>Тут и Там</h1>
        </div>
      </div>

      <div className={styles.greetingSection}>
        <div className={styles.greetingTitle}>{currentGreeting}</div>
        <div className={styles.greetingSubtitleRow}>
          <IconLocationPinFilled size={13} className={styles.locationPinIcon} />
          <span className={styles.cityText}>{displayCity}</span>
        </div>
      </div>
    </header>
  )
}
