import React from 'react'
import { useTranslation } from 'react-i18next'
import type { StepConfig } from './types'
import { WIZARD_STEPS } from './useCreateEventWizard'
import styles from './CreateEventProgress.module.css'

interface CreateEventProgressProps {
  currentStep: StepConfig
  currentStepIndex: number
  totalSteps: number
}

export const CreateEventProgress: React.FC<CreateEventProgressProps> = ({
  currentStep,
  currentStepIndex,
  totalSteps,
}) => {
  const { t } = useTranslation()

  return (
    <div className={styles.progressContainer}>
      {/* 1. Step label & Segmented Progress Bar */}
      <div className={styles.metaRow}>
        <span className={styles.stepBadge}>
          {t('createEvent.stepOf', { current: currentStepIndex + 1, total: totalSteps })}
        </span>
      </div>

      <div
        className={styles.segmentedBar}
        role="progressbar"
        aria-valuenow={currentStepIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={t('createEvent.stepOf', { current: currentStepIndex + 1, total: totalSteps })}
      >
        {WIZARD_STEPS.map((step, idx) => (
          <div
            key={step.id}
            className={`${styles.segment} ${idx <= currentStepIndex ? styles.segmentActive : ''}`}
          />
        ))}
      </div>

      {/* 2. Step Title & Short Helper */}
      <div className={styles.titleSection}>
        <h2 className={styles.stepTitle}>{t(currentStep.titleKey)}</h2>
        <p className={styles.stepHelper}>{t(currentStep.helperKey)}</p>
      </div>
    </div>
  )
}
