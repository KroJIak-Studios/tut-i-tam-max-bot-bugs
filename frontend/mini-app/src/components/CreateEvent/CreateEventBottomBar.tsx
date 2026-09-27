import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './CreateEventBottomBar.module.css'

interface CreateEventBottomBarProps {
  isFirstStep: boolean
  isLastStep: boolean
  isSubmitting?: boolean
  isDraftValid?: boolean
  onNext: () => void
  onPrev: () => void
  onSubmit?: () => void
}

export const CreateEventBottomBar: React.FC<CreateEventBottomBarProps> = ({
  isFirstStep,
  isLastStep,
  isSubmitting = false,
  isDraftValid = true,
  onNext,
  onPrev,
  onSubmit,
}) => {
  const { t } = useTranslation()

  const submitDisabled = isSubmitting || !isDraftValid

  return (
    <footer className={styles.bottomBarWrapper}>
      <div className={styles.bottomBar}>
        {!isFirstStep && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={onPrev}
            disabled={isSubmitting}
          >
            <span>{t('createEvent.actions.back')}</span>
          </button>
        )}

        {isLastStep ? (
          <button
            type="button"
            className={`${styles.primaryBtn} ${
              !isDraftValid
                ? styles.submitBtnDisabled
                : isSubmitting
                  ? styles.submitBtnLoading
                  : ''
            }`}
            onClick={onSubmit}
            disabled={submitDisabled}
            aria-disabled={submitDisabled}
          >
            <span>
              {isSubmitting
                ? t('createEvent.actions.submitting')
                : t('createEvent.actions.submit')}
            </span>
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
