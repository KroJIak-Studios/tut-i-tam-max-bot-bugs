import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CreateEventTopBar } from './CreateEventTopBar'
import { CreateEventProgress } from './CreateEventProgress'
import { CreateEventStepContent } from './CreateEventStepContent'
import { CreateEventBottomBar } from './CreateEventBottomBar'
import { CreateEventExitConfirmModal } from './CreateEventExitConfirmModal'
import { CreateEventSuccessView } from './CreateEventSuccessView'
import { useCreateEventWizard } from './useCreateEventWizard'
import { submitCreateEventRequest } from '../../services/createEventRequestService'
import type { CreateEventDraft, CreateEventRequest, StepErrors } from './types'
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

function validateAll(draft: CreateEventDraft): {
  valid: boolean
  firstInvalidStepIndex?: number
  errors?: StepErrors
} {
  const basicsErrors = validateStep('basics', draft)
  if (Object.keys(basicsErrors).length > 0) {
    return { valid: false, firstInvalidStepIndex: 0, errors: basicsErrors }
  }
  const datetimeErrors = validateStep('datetime', draft)
  if (Object.keys(datetimeErrors).length > 0) {
    return { valid: false, firstInvalidStepIndex: 1, errors: datetimeErrors }
  }
  const locationErrors = validateStep('location', draft)
  if (Object.keys(locationErrors).length > 0) {
    return { valid: false, firstInvalidStepIndex: 2, errors: locationErrors }
  }
  return { valid: true }
}

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedRequest, setSubmittedRequest] = useState<CreateEventRequest | null>(null)
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false)

  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    draft,
    errors,
    isDirty,
    nextStep,
    prevStep,
    goToStep,
    updateDraft,
    setStepErrors,
    resetDraft,
  } = useCreateEventWizard()

  const isDraftValid = validateAll(draft).valid

  const handleExit = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/plans')
    }
  }, [navigate])

  const handleSuccessDone = useCallback(() => {
    navigate('/profile/requests')
  }, [navigate])

  const handleBackClick = useCallback(() => {
    if (submittedRequest) {
      navigate('/profile/requests')
    } else if (isDirty) {
      setIsExitConfirmOpen(true)
    } else {
      handleExit()
    }
  }, [handleExit, isDirty, navigate, submittedRequest])

  const handleStay = useCallback(() => {
    setIsExitConfirmOpen(false)
  }, [])

  const handleLeave = useCallback(() => {
    setIsExitConfirmOpen(false)
    resetDraft()
    handleExit()
  }, [handleExit, resetDraft])

  const handleNext = useCallback(() => {
    const stepErrors = validateStep(currentStep.id, draft)

    if (Object.keys(stepErrors).length > 0) {
      setStepErrors(stepErrors)
      return
    }

    nextStep()
  }, [currentStep.id, draft, nextStep, setStepErrors])

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return

    const validation = validateAll(draft)
    if (!validation.valid && validation.firstInvalidStepIndex !== undefined) {
      goToStep(validation.firstInvalidStepIndex)
      if (validation.errors) {
        setStepErrors(validation.errors)
      }
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    const locale = (i18n.language === 'en-US' ? 'en-US' : 'ru-RU') as 'ru-RU' | 'en-US'
    const result = await submitCreateEventRequest(draft, locale)

    if (result.success && result.data) {
      setSubmittedRequest(result.data)
      setIsSubmitting(false)
    } else {
      setSubmitError(result.error || t('createEvent.errors.submitFailed'))
      setIsSubmitting(false)
    }
  }, [draft, goToStep, i18n.language, isSubmitting, setStepErrors, t])

  const handleCreateAnother = useCallback(() => {
    setSubmittedRequest(null)
    setSubmitError(null)
    resetDraft()
  }, [resetDraft])

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
      <CreateEventTopBar onBack={handleBackClick} />

      {/* 2. Scrollable body */}
      <main className={styles.scrollArea} aria-label={t('createEvent.pageTitle')}>
        <div className={styles.contentWrapper}>
          {submittedRequest ? (
            <CreateEventSuccessView
              request={submittedRequest}
              onDone={handleSuccessDone}
              onCreateAnother={handleCreateAnother}
            />
          ) : (
            <>
              <CreateEventProgress
                currentStep={currentStep}
                currentStepIndex={currentStepIndex}
                totalSteps={totalSteps}
              />

              <CreateEventStepContent
                currentStep={currentStep}
                draft={draft}
                errors={errors}
                submitError={submitError}
                onUpdate={updateDraft}
                onGoToStep={goToStep}
                onClearError={clearFieldError}
              />
            </>
          )}
        </div>
      </main>

      {/* 3. Sticky bottom bar (hidden when success screen is active) */}
      {!submittedRequest && (
        <CreateEventBottomBar
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isSubmitting={isSubmitting}
          isDraftValid={isDraftValid}
          onNext={handleNext}
          onPrev={prevStep}
          onSubmit={handleSubmit}
        />
      )}

      {/* 4. Exit confirmation modal for unsaved drafts */}
      <CreateEventExitConfirmModal
        isOpen={isExitConfirmOpen}
        onStay={handleStay}
        onLeave={handleLeave}
      />
    </div>
  )
}
