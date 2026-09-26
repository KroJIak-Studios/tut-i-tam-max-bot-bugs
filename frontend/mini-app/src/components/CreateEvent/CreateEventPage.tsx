import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CreateEventTopBar } from './CreateEventTopBar'
import { CreateEventProgress } from './CreateEventProgress'
import { CreateEventStepContent } from './CreateEventStepContent'
import { CreateEventBottomBar } from './CreateEventBottomBar'
import { useCreateEventWizard } from './useCreateEventWizard'
import styles from './CreateEventPage.module.css'

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
  } = useCreateEventWizard()

  const handleExit = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/plans')
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* 1. Header (Sticky) */}
      <CreateEventTopBar onBack={handleExit} />

      {/* 2. Scrollable Body */}
      <main className={styles.scrollArea}>
        <div className={styles.contentWrapper}>
          {/* Progress Indicator & Step Header */}
          <CreateEventProgress
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
          />

          {/* Current Step Content (Placeholder for Stage 4) */}
          <CreateEventStepContent currentStep={currentStep} />
        </div>
      </main>

      {/* 3. Sticky Bottom Actions Bar */}
      <CreateEventBottomBar
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onNext={nextStep}
        onPrev={prevStep}
      />
    </div>
  )
}
