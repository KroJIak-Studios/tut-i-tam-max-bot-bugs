import { useState, useCallback } from 'react'
import type { CreateEventDraft, StepConfig, StepErrors } from './types'
import { calculateDefaultEndDateTime } from '../../utils/formatters'

export const WIZARD_STEPS: StepConfig[] = [
  {
    id: 'basics',
    stepNumber: 1,
    titleKey: 'createEvent.steps.basics.title',
    helperKey: 'createEvent.steps.basics.helper',
  },
  {
    id: 'datetime',
    stepNumber: 2,
    titleKey: 'createEvent.steps.datetime.title',
    helperKey: 'createEvent.steps.datetime.helper',
  },
  {
    id: 'location',
    stepNumber: 3,
    titleKey: 'createEvent.steps.location.title',
    helperKey: 'createEvent.steps.location.helper',
  },
  {
    id: 'review',
    stepNumber: 4,
    titleKey: 'createEvent.steps.review.title',
    helperKey: 'createEvent.steps.review.helper',
  },
]

export const INITIAL_DRAFT: CreateEventDraft = {
  title: '',
  description: '',
  category: '',
  date: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  address: '',
  isFree: true,
  pushkinCard: false,
  source: 'user',
}

export function useCreateEventWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [draft, setDraft] = useState<CreateEventDraft>(INITIAL_DRAFT)
  const [errors, setErrors] = useState<StepErrors>({})

  const currentStep = WIZARD_STEPS[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => (prev < WIZARD_STEPS.length - 1 ? prev + 1 : prev))
    setErrors({})
  }, [])

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : prev))
    setErrors({})
  }, [])

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < WIZARD_STEPS.length) {
      setCurrentStepIndex(stepIndex)
      setErrors({})
    }
  }, [])

  const updateDraft = useCallback((patch: Partial<CreateEventDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch }

      if (patch.startDate !== undefined) {
        next.date = patch.startDate
      }

      const isUpdatingStart = patch.startDate !== undefined || patch.startTime !== undefined
      const isExplicitEnd = patch.endDate !== undefined || patch.endTime !== undefined

      if (isUpdatingStart && !isExplicitEnd) {
        const curStartD = next.startDate
        const curStartT = next.startTime

        const prevDefault = calculateDefaultEndDateTime(prev.startDate, prev.startTime)
        const endUntouched = !prev.endDate && !prev.endTime
        const endMatchesPrevDefault =
          prev.endDate === prevDefault.endDate && prev.endTime === prevDefault.endTime

        if (endUntouched || endMatchesPrevDefault) {
          if (curStartD && curStartT) {
            const nextDefault = calculateDefaultEndDateTime(curStartD, curStartT)
            next.endDate = nextDefault.endDate
            next.endTime = nextDefault.endTime
          } else if (curStartD && !curStartT && (!prev.endDate || prev.endDate === prev.startDate)) {
            next.endDate = curStartD
          }
        }
      }

      return next
    })
  }, [])

  const setStepErrors = useCallback((newErrors: StepErrors | ((prev: StepErrors) => StepErrors)) => {
    setErrors(newErrors)
  }, [])


  const resetDraft = useCallback(() => {
    setDraft(INITIAL_DRAFT)
    setCurrentStepIndex(0)
    setErrors({})
  }, [])

  const isDirty = Boolean(
    draft.title.trim() ||
    draft.description.trim() ||
    draft.category ||
    draft.startDate ||
    draft.startTime ||
    draft.endDate ||
    draft.endTime ||
    draft.address.trim()
  )

  return {
    currentStepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    totalSteps: WIZARD_STEPS.length,
    draft,
    errors,
    isDirty,
    nextStep,
    prevStep,
    goToStep,
    updateDraft,
    setStepErrors,
    resetDraft,
  }
}
