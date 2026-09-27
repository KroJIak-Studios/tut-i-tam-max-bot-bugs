import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CreateEventTopBar } from './CreateEventTopBar'
import { CreateEventProgress } from './CreateEventProgress'
import { CreateEventStepContent } from './CreateEventStepContent'
import { CreateEventBottomBar } from './CreateEventBottomBar'
import { useCreateEventWizard } from './useCreateEventWizard'
import type { CreateEventDraft, StepErrors } from './types'
import styles from './CreateEventPage.module.css'

function validateStep(
  stepId: string,
  draft: CreateEventDraft,
): StepErrors {
  const errors: StepErrors = {}
  const today = new Date().toISOString().slice(0, 10)

  if (stepId === 'basics') {
    if (!draft.title.trim()) {
      errors.title = 'createEvent.errors.titleRequired'
    }
    if (!draft.description.trim()) {
      errors.description = 'createEvent.errors.descriptionRequired'
    }
    if (!draft.category) {
      errors.category = 'createEvent.errors.categoryRequired'
    }
  }

  if (stepId === 'datetime') {
    if (!draft.date) {
      errors.date = 'createEvent.errors.dateRequired'
    } else if (draft.date < today) {
      errors.date = 'createEvent.errors.datePast'
    }
    if (!draft.startTime) {
      errors.startTime = 'createEvent.errors.startTimeRequired'
    }
  }

  if (stepId === 'location') {
    if (!draft.address.trim()) {
      errors.address = 'createEvent.errors.addressRequired'
    }
  }

  return errors
}

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    draft,
    errors,
    nextStep,
    prevStep,
    goToStep,
    updateDraft,
    setStepErrors,
  } = useCreateEventWizard()

  const handleExit = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/plans')
    }
  }, [navigate])

  const handleNext = useCallback(() => {
    // Review step — submit is disabled, so nothing to do
    if (isLastStep) return

    const stepErrors = validateStep(currentStep.id, draft)

    if (Object.keys(stepErrors).length > 0) {
      setStepErrors(stepErrors)
      return
    }

    nextStep()
  }, [currentStep.id, draft, isLastStep, nextStep, setStepErrors])

  const clearFieldError = useCallback((field: keyof StepErrors) => {
    setStepErrors((prev: StepErrors) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [setStepErrors])

  return (
    <div className={styles.pageContainer}>
      {/* 1. Header */}
      <CreateEventTopBar onBack={handleExit} />

      {/* 2. Scrollable body */}
      <main className={styles.scrollArea} aria-label={t('createEvent.pageTitle')}>
        <div className={styles.contentWrapper}>
          <CreateEventProgress
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
          />

          <CreateEventStepContent
            currentStep={currentStep}
            draft={draft}
            errors={errors}
            onUpdate={updateDraft}
            onGoToStep={goToStep}
            onClearError={clearFieldError}
          />
        </div>
      </main>

      {/* 3. Sticky bottom bar */}
      <CreateEventBottomBar
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onNext={handleNext}
        onPrev={prevStep}
      />
    </div>
  )
}
