import React from 'react'
import { useTranslation } from 'react-i18next'
import type { CreateEventRequest } from '../../CreateEvent/types'
import { IconChevronRight, IconLocationPin, IconClock } from '../../Icons'
import { formatEventDateTimeRange, formatSubmissionDate } from '../../../utils/formatters'
import styles from './UserRequestCard.module.css'

interface UserRequestCardProps {
  request: CreateEventRequest
  onClick: () => void
}

export const UserRequestCard: React.FC<UserRequestCardProps> = ({ request, onClick }) => {
  const { t, i18n } = useTranslation()

  const categoryLabel = request.category

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

  const submittedFormatted = request.createdAt
    ? formatSubmissionDate(request.createdAt, i18n.language)
    : '—'

  const statusLabel = t(`userRequests.status.${request.status}`)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <article
      className={styles.card}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${request.title}, ${statusLabel}`}
    >
      {/* 1. Header with Badges */}
      <div className={styles.cardHeader}>
        <span className={`${styles.statusBadge} ${styles[request.status]}`}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span>{statusLabel}</span>
        </span>

        <div className={styles.rightBadges}>
          <span className={styles.locationBadge}>
            {request.locationMode === 'area'
              ? `⬡ ${t('userRequests.locationModeArea')}`
              : `📍 ${t('userRequests.locationModePoint')}`}
          </span>
          {categoryLabel && (
            <span className={styles.categoryBadge}>{categoryLabel}</span>
          )}
        </div>
      </div>

      {/* 2. Main Title */}
      <h3 className={styles.title}>{request.title}</h3>

      {/* 3. Date & Time */}
      <div className={styles.metaRow}>
        <div className={styles.metaIcon} aria-hidden="true">
          <IconClock size={15} color="#6B7280" />
        </div>
        <span className={styles.metaText}>{datetimeFormatted}</span>
      </div>

      {/* 4. Location */}
      <div className={styles.metaRow}>
        <div className={styles.metaIcon} aria-hidden="true">
          <IconLocationPin size={15} color="#6B7280" />
        </div>
        <span className={styles.metaText}>{request.address}</span>
      </div>

      {/* 5. Footer */}
      <div className={styles.cardFooter}>
        <span className={styles.submittedDate}>
          {t('userRequests.submittedAt', { date: submittedFormatted })}
        </span>
        <div className={styles.chevron} aria-hidden="true">
          <IconChevronRight size={16} color="#9CA3AF" />
        </div>
      </div>
    </article>
  )
}
