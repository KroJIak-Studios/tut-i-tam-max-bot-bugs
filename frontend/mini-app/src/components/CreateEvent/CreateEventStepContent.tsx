import React from 'react'
import { useTranslation } from 'react-i18next'
import type { CreateEventDraft, StepConfig, StepErrors } from './types'
import { USER_EVENT_CATEGORIES } from './types'
import type { EventCategory } from '../../types'
import { formatEventDateTimeRange } from '../../utils/formatters'
import { CreateEventLocationMap } from './CreateEventLocationMap'
import { CreateEventLocationPreview } from './CreateEventLocationPreview'
import styles from './CreateEventStepContent.module.css'

interface CreateEventStepContentProps {
  currentStep: StepConfig
  draft: CreateEventDraft
  errors: StepErrors
  submitError?: string | null
  onUpdate: (patch: Partial<CreateEventDraft>) => void
  onGoToStep: (idx: number) => void
  onClearError: (field: keyof StepErrors) => void
}

const TITLE_MAX = 80
const DESC_MAX = 500

// ── Step 1: Basics ────────────────────────────────────────────────────────────

const StepBasics: React.FC<{
  draft: CreateEventDraft
  errors: StepErrors
  onUpdate: (patch: Partial<CreateEventDraft>) => void
  onClearError: (field: keyof StepErrors) => void
}> = ({ draft, errors, onUpdate, onClearError }) => {
  const { t } = useTranslation()

  return (
    <>
      {/* Title */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="ce-title">
          {t('createEvent.fields.titleLabel')}
        </label>
        <input
          id="ce-title"
          type="text"
          className={`${styles.input} ${errors.title ? styles.hasError : ''}`}
          value={draft.title}
          placeholder={t('createEvent.fields.titlePlaceholder')}
          maxLength={TITLE_MAX}
          onChange={(e) => {
            onUpdate({ title: e.target.value })
            if (errors.title) onClearError('title')
          }}
          autoComplete="off"
        />
        <div className={styles.charCounter}>
          {draft.title.length}/{TITLE_MAX}
        </div>
        {errors.title && (
          <span className={styles.errorMsg} role="alert">
            {t(errors.title)}
          </span>
        )}
      </div>

      {/* Description */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="ce-desc">
          {t('createEvent.fields.descriptionLabel')}
        </label>
        <textarea
          id="ce-desc"
          className={`${styles.textarea} ${errors.description ? styles.hasError : ''}`}
          value={draft.description}
          placeholder={t('createEvent.fields.descriptionPlaceholder')}
          maxLength={DESC_MAX}
          onChange={(e) => {
            onUpdate({ description: e.target.value })
            if (errors.description) onClearError('description')
          }}
        />
        <div className={styles.charCounter}>
          {draft.description.length}/{DESC_MAX}
        </div>
        {errors.description && (
          <span className={styles.errorMsg} role="alert">
            {t(errors.description)}
          </span>
        )}
      </div>

      {/* Category */}
      <div className={styles.formGroup}>
        <span className={styles.label}>{t('createEvent.fields.categoryLabel')}</span>
        <div className={`${styles.chipsRow} ${errors.category ? styles.chipsError : ''}`}>
          {USER_EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.chip} ${draft.category === cat ? styles.chipSelected : ''}`}
              onClick={() => {
                onUpdate({ category: draft.category === cat ? '' : (cat as EventCategory) })
                if (errors.category) onClearError('category')
              }}
              aria-pressed={draft.category === cat}
            >
              {t(`createEvent.categories.${cat}`)}
            </button>
          ))}
        </div>
        {errors.category && (
          <span className={styles.errorMsg} role="alert">
            {t(errors.category)}
          </span>
        )}
      </div>
    </>
  )
}

// ── Step 2: Date & Time ───────────────────────────────────────────────────────

const StepDatetime: React.FC<{
  draft: CreateEventDraft
  errors: StepErrors
  onUpdate: (patch: Partial<CreateEventDraft>) => void
  onClearError: (field: keyof StepErrors) => void
}> = ({ draft, errors, onUpdate, onClearError }) => {
  const { t } = useTranslation()
  const today = new Date().toISOString().slice(0, 10)
  const currentStartDate = draft.startDate || draft.date || ''

  return (
    <>
      {/* Group: Начало / Start */}
      <div className={styles.subGroup}>
        <div className={styles.subGroupTitle}>{t('createEvent.fields.startGroupTitle')}</div>

        {/* Start Date */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="ce-start-date">
            {t('createEvent.fields.startDateLabel')}
          </label>
          <input
            id="ce-start-date"
            type="date"
            className={`${styles.input} ${errors.startDate ? styles.hasError : ''}`}
            value={currentStartDate}
            min={today}
            onChange={(e) => {
              onUpdate({ startDate: e.target.value, date: e.target.value })
              if (errors.startDate) onClearError('startDate')
              if (errors.range) onClearError('range')
            }}
          />
          {errors.startDate && (
            <span className={styles.errorMsg} role="alert">
              {t(errors.startDate)}
            </span>
          )}
        </div>

        {/* Start Time */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="ce-start-time">
            {t('createEvent.fields.startTimeLabel')}
          </label>
          <input
            id="ce-start-time"
            type="time"
            className={`${styles.input} ${errors.startTime ? styles.hasError : ''}`}
            value={draft.startTime}
            onChange={(e) => {
              onUpdate({ startTime: e.target.value })
              if (errors.startTime) onClearError('startTime')
              if (errors.range) onClearError('range')
            }}
          />
          {errors.startTime && (
            <span className={styles.errorMsg} role="alert">
              {t(errors.startTime)}
            </span>
          )}
        </div>
      </div>

      {/* Group: Окончание / End */}
      <div className={styles.subGroup}>
        <div className={styles.subGroupTitle}>{t('createEvent.fields.endGroupTitle')}</div>

        {/* End Date */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="ce-end-date">
            {t('createEvent.fields.endDateLabel')}
          </label>
          <input
            id="ce-end-date"
            type="date"
            className={`${styles.input} ${errors.endDate || errors.range ? styles.hasError : ''}`}
            value={draft.endDate}
            min={currentStartDate || today}
            onChange={(e) => {
              onUpdate({ endDate: e.target.value })
              if (errors.endDate) onClearError('endDate')
              if (errors.range) onClearError('range')
            }}
          />
          {errors.endDate && (
            <span className={styles.errorMsg} role="alert">
              {t(errors.endDate)}
            </span>
          )}
        </div>

        {/* End Time */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="ce-end-time">
            {t('createEvent.fields.endTimeLabel')}
          </label>
          <input
            id="ce-end-time"
            type="time"
            placeholder={t('createEvent.fields.endTimePlaceholder')}
            className={`${styles.input} ${errors.endTime || errors.range ? styles.hasError : ''}`}
            value={draft.endTime}
            onChange={(e) => {
              onUpdate({ endTime: e.target.value })
              if (errors.endTime) onClearError('endTime')
              if (errors.range) onClearError('range')
            }}
          />
          {errors.endTime && (
            <span className={styles.errorMsg} role="alert">
              {t(errors.endTime)}
            </span>
          )}
        </div>
      </div>

      {/* Range error message */}
      {errors.range && (
        <span className={styles.errorMsg} role="alert">
          {t(errors.range)}
        </span>
      )}
    </>
  )
}

// ── Step 3: Location ──────────────────────────────────────────────────────────

const StepLocation: React.FC<{
  draft: CreateEventDraft
  errors: StepErrors
  onUpdate: (patch: Partial<CreateEventDraft>) => void
  onClearError: (field: keyof StepErrors) => void
}> = ({ draft, errors, onUpdate, onClearError }) => {
  const { t } = useTranslation()

  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="ce-address">
          {t('createEvent.fields.addressLabel')}
        </label>
        <input
          id="ce-address"
          type="text"
          className={`${styles.input} ${errors.address ? styles.hasError : ''}`}
          value={draft.address}
          placeholder={t('createEvent.fields.addressPlaceholder')}
          onChange={(e) => {
            onUpdate({ address: e.target.value })
            if (errors.address) onClearError('address')
          }}
          autoComplete="off"
        />
        {errors.address && (
          <span className={styles.errorMsg} role="alert">
            {t(errors.address)}
          </span>
        )}
      </div>

      <CreateEventLocationMap
        mode={draft.locationMode || 'point'}
        point={draft.locationPoint}
        area={draft.locationArea}
        onModeChange={(mode) => {
          onUpdate({ locationMode: mode })
          if (errors.locationArea) onClearError('locationArea')
        }}
        onPointChange={(point) => {
          onUpdate({ locationPoint: point })
        }}
        onAreaChange={(area) => {
          onUpdate({ locationArea: area })
          if (errors.locationArea && (area.points?.length || 0) >= 3) {
            onClearError('locationArea')
          }
        }}
        error={errors.locationArea}
      />
    </>
  )
}

// ── Step 4: Review ────────────────────────────────────────────────────────────

const StepReview: React.FC<{
  draft: CreateEventDraft
  submitError?: string | null
  onGoToStep: (idx: number) => void
}> = ({ draft, submitError, onGoToStep }) => {
  const { t, i18n } = useTranslation()

  const categoryLabel =
    draft.category ? t(`createEvent.categories.${draft.category}`) : '—'

  const effectiveStartDate = draft.startDate || draft.date || ''
  const effectiveEndDate = draft.endDate || effectiveStartDate

  const datetimeFormatted = effectiveStartDate
    ? formatEventDateTimeRange(
        effectiveStartDate,
        draft.startTime,
        effectiveEndDate,
        draft.endTime,
        i18n.language
      )
    : '—'

  return (
    <>
      {submitError && (
        <div className={styles.submitErrorBanner} role="alert">
          <span>{submitError}</span>
        </div>
      )}

      <div className={styles.reviewRows}>
        {/* Title */}
        <div className={styles.reviewRow}>
          <div>
            <div className={styles.reviewRowLabel}>{t('createEvent.review.titleLabel')}</div>
            <div className={styles.reviewRowValue}>{draft.title || '—'}</div>
          </div>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => onGoToStep(0)}
            aria-label={`${t('createEvent.review.editLabel')}: ${t('createEvent.review.titleLabel')}`}
          >
            {t('createEvent.review.editLabel')}
          </button>
        </div>

        {/* Description */}
        <div className={styles.reviewRow}>
          <div>
            <div className={styles.reviewRowLabel}>{t('createEvent.review.descriptionLabel')}</div>
            <div className={styles.reviewRowValue}>{draft.description || '—'}</div>
          </div>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => onGoToStep(0)}
            aria-label={`${t('createEvent.review.editLabel')}: ${t('createEvent.review.descriptionLabel')}`}
          >
            {t('createEvent.review.editLabel')}
          </button>
        </div>

        {/* Category */}
        <div className={styles.reviewRow}>
          <div>
            <div className={styles.reviewRowLabel}>{t('createEvent.review.categoryLabel')}</div>
            <div className={styles.reviewRowValue}>{categoryLabel}</div>
          </div>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => onGoToStep(0)}
            aria-label={`${t('createEvent.review.editLabel')}: ${t('createEvent.review.categoryLabel')}`}
          >
            {t('createEvent.review.editLabel')}
          </button>
        </div>

        {/* Date & time */}
        <div className={styles.reviewRow}>
          <div>
            <div className={styles.reviewRowLabel}>{t('createEvent.review.datetimeLabel')}</div>
            <div className={styles.reviewRowValue}>{datetimeFormatted}</div>
          </div>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => onGoToStep(1)}
            aria-label={`${t('createEvent.review.editLabel')}: ${t('createEvent.review.datetimeLabel')}`}
          >
            {t('createEvent.review.editLabel')}
          </button>
        </div>

        {/* Location */}
        <div className={styles.reviewRow}>
          <div>
            <div className={styles.reviewRowLabel}>{t('createEvent.review.locationLabel')}</div>
            <div className={styles.reviewRowValue}>{draft.address || '—'}</div>
            <div className={styles.reviewLocationMeta}>
              <span className={styles.reviewLocationBadge}>
                {draft.locationMode === 'area'
                  ? `⬡ ${t('createEvent.review.locationModeArea', { count: draft.locationArea?.points?.length || 0 })}`
                  : `📍 ${t('createEvent.review.locationModePoint')}`}
              </span>
            </div>
            <div className={styles.reviewMapContainer}>
              <CreateEventLocationPreview
                mode={draft.locationMode || 'point'}
                point={draft.locationPoint}
                area={draft.locationArea}
                height={120}
              />
            </div>
          </div>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => onGoToStep(2)}
            aria-label={`${t('createEvent.review.editLabel')}: ${t('createEvent.review.locationLabel')}`}
          >
            {t('createEvent.review.editLabel')}
          </button>
        </div>
      </div>

      {/* Notices */}
      <div className={styles.notices}>
        <div className={styles.notice}>
          <span className={styles.noticeIcon}>🎟</span>
          <span className={styles.noticeText}>{t('createEvent.review.freeNotice')}</span>
        </div>
        <div className={styles.notice}>
          <span className={styles.noticeIcon}>🔍</span>
          <span className={styles.noticeText}>{t('createEvent.review.moderationNotice')}</span>
        </div>
      </div>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export const CreateEventStepContent: React.FC<CreateEventStepContentProps> = ({
  currentStep,
  draft,
  errors,
  submitError,
  onUpdate,
  onGoToStep,
  onClearError,
}) => {
  const renderStep = () => {
    switch (currentStep.id) {
      case 'basics':
        return <StepBasics draft={draft} errors={errors} onUpdate={onUpdate} onClearError={onClearError} />
      case 'datetime':
        return <StepDatetime draft={draft} errors={errors} onUpdate={onUpdate} onClearError={onClearError} />
      case 'location':
        return <StepLocation draft={draft} errors={errors} onUpdate={onUpdate} onClearError={onClearError} />
      case 'review':
        return <StepReview draft={draft} submitError={submitError} onGoToStep={onGoToStep} />
    }
  }

  return <div className={styles.stepContent}>{renderStep()}</div>
}
