import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { CreateEventRequest } from './types'
import { IconCheck } from '../Icons'
import { formatEventDateTimeRange } from '../../utils/formatters'
import { CreateEventLocationPreview } from './CreateEventLocationPreview'
import styles from './CreateEventSuccessView.module.css'

interface CreateEventSuccessViewProps {
  request: CreateEventRequest
  onDone: () => void
  onCreateAnother: () => void
}

export const CreateEventSuccessView: React.FC<CreateEventSuccessViewProps> = ({
  request,
  onDone,
  onCreateAnother,
}) => {
  const { t, i18n } = useTranslation()
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // Focus heading on mount for screen readers and keyboard users
    headingRef.current?.focus()
  }, [])

  const categoryLabel = request.category || '—'

  const effectiveStartDate = request.startDate || request.date || ''
  const effectiveEndDate = request.endDate || effectiveStartDate

  const datetimeFormatted = effectiveStartDate
    ? formatEventDateTimeRange(
        effectiveStartDate,
        request.startTime,
        effectiveEndDate,
        request.endTime,
        i18n.language
      )
    : '—'

  return (
    <div className={styles.successWrapper}>
      {/* 1. Success badge icon */}
      <div className={styles.iconCircle} aria-hidden="true">
        <IconCheck size={32} color="currentColor" strokeWidth={2.5} />
      </div>

      {/* 2. Titles */}
      <h2
        ref={headingRef}
        className={styles.title}
        tabIndex={-1}
      >
        {t('createEvent.success.title')}
      </h2>
      <p className={styles.description}>
        {t('createEvent.success.description')}
      </p>

      {/* 3. Details summary card */}
      <div className={styles.detailsCard}>
        <div className={styles.statusHeader}>
          <span className={styles.statusLabel}>{t('createEvent.success.statusLabel')}</span>
          <span className={styles.statusBadge}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span>{t('createEvent.success.statusUnderReview')}</span>
          </span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>{t('createEvent.review.titleLabel')}</span>
          <span className={styles.detailValue}>{request.title}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>{t('createEvent.review.categoryLabel')}</span>
          <span className={styles.detailValue}>{categoryLabel}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>{t('createEvent.review.datetimeLabel')}</span>
          <span className={styles.detailValue}>{datetimeFormatted}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>{t('createEvent.review.locationLabel')}</span>
          <span className={styles.detailValue}>
            {request.address}
            <span className={styles.locationBadge}>
              {request.locationMode === 'area'
                ? `⬡ ${t('createEvent.review.locationModeArea', { count: request.locationArea?.points?.length || 0 })}`
                : `📍 ${t('createEvent.review.locationModePoint')}`}
            </span>
          </span>
          <div className={styles.mapPreviewWrapper}>
            <CreateEventLocationPreview
              mode={request.locationMode || 'point'}
              point={request.locationPoint}
              area={request.locationArea}
              height={110}
            />
          </div>
        </div>
      </div>

      {/* 4. Action buttons */}
      <div className={styles.actionsSection}>
        <button
          type="button"
          className={styles.doneBtn}
          onClick={onDone}
        >
          <span>{t('createEvent.success.doneBtn')}</span>
        </button>

        <button
          type="button"
          className={styles.createAnotherBtn}
          onClick={onCreateAnother}
        >
          <span>{t('createEvent.success.createAnotherBtn')}</span>
        </button>
      </div>
    </div>
  )
}
