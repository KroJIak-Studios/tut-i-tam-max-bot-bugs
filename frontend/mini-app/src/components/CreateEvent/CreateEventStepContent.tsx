import React from 'react'
import { useTranslation } from 'react-i18next'
import type { StepConfig } from './types'
import { IconPencil, IconCalendar, IconLocationPin, IconCheck } from '../Icons'
import styles from './CreateEventStepContent.module.css'

interface CreateEventStepContentProps {
  currentStep: StepConfig
}

export const CreateEventStepContent: React.FC<CreateEventStepContentProps> = ({
  currentStep,
}) => {
  const { t } = useTranslation()

  const renderIcon = () => {
    switch (currentStep.id) {
      case 'basics':
        return <IconPencil size={24} color="var(--color-primary, #2563EB)" />
      case 'datetime':
        return <IconCalendar size={24} color="var(--color-primary, #2563EB)" />
      case 'location':
        return <IconLocationPin size={24} color="var(--color-primary, #2563EB)" />
      case 'review':
        return <IconCheck size={24} color="var(--color-primary, #2563EB)" />
    }
  }

  return (
    <div className={styles.contentContainer}>
      <div className={styles.placeholderCard}>
        <div className={styles.iconCircle}>
          {renderIcon()}
        </div>
        <p className={styles.placeholderText}>
          {t(currentStep.placeholderKey)}
        </p>
      </div>
    </div>
  )
}
