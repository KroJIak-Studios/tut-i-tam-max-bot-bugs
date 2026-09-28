import React from 'react'
import { useTranslation } from 'react-i18next'
import { IconChevronLeft } from '../Icons'
import styles from './CreateEventTopBar.module.css'

interface CreateEventTopBarProps {
  onBack: () => void
}

export const CreateEventTopBar: React.FC<CreateEventTopBarProps> = ({ onBack }) => {
  const { t } = useTranslation()

  return (
    <header className={styles.topBarWrapper}>
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={onBack}
          aria-label={t('common.back')}
        >
          <IconChevronLeft size={20} color="currentColor" />
          <span>{t('common.back')}</span>
        </button>
        <h1 className={styles.pageTitle}>{t('createEvent.pageTitle')}</h1>
        <div className={styles.topBarSpacer} />
      </div>
    </header>
  )
}
