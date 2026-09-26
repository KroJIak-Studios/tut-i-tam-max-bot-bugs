import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './CreateEventBottomBar.module.css'

interface CreateEventBottomBarProps {
  isFirstStep: boolean
  isLastStep: boolean
  onNext: () => void
  onPrev: () => void
}

export const CreateEventBottomBar: React.FC<CreateEventBottomBarProps> = ({
  isFirstStep,
  isLastStep,
  onNext,
  onPrev,
}) => {
  const { t } = useTranslation()

  return (
    <footer className={styles.bottomBarWrapper}>
      <div className={styles.bottomBar}>
        {!isFirstStep && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={onPrev}
          >
            <span>{t('createEvent.actions.back')}</span>
          </button>
        )}

        {isLastStep ? (
          <button
            type="button"
            className={`${styles.primaryBtn} ${styles.submitBtnDisabled}`}
            disabled
            aria-disabled="true"
          >
            <span>{t('createEvent.actions.submit')}</span>
          </button>
        ) : (
          <button
            type="button"
            className={`${styles.primaryBtn} ${isFirstStep ? styles.primaryBtnFull : ''}`}
            onClick={onNext}
          >
            <span>{t('createEvent.actions.next')}</span>
          </button>
        )}
      </div>
    </footer>
  )
}
