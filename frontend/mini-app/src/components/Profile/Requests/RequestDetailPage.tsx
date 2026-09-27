import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { NavTabId } from '../../../types'
import type { CreateEventRequest } from '../../CreateEvent/types'
import { getCreateEventRequestById, getStoredRequestsSync } from '../../../services/createEventRequestService'
import { RequestsTopBar } from './RequestsTopBar'
import { BottomNavigation } from '../../BottomNavigation'
import { IconChat, IconTicket } from '../../Icons'
import { formatEventDateTimeRange, formatSubmissionDate } from '../../../utils/formatters'
import styles from './RequestDetailPage.module.css'

export const RequestDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const [request, setRequest] = useState<CreateEventRequest | null>(() => {
    if (!requestId) return null
    return getStoredRequestsSync().find((r) => r.id === requestId) || null
  })
  const [loading, setLoading] = useState(() => {
    if (!requestId) return false
    return !getStoredRequestsSync().some((r) => r.id === requestId)
  })

  useEffect(() => {
    let isMounted = true
    if (requestId) {
      getCreateEventRequestById(requestId).then((data) => {
        if (isMounted) {
          setRequest(data)
          setLoading(false)
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [requestId])

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/')
    else if (tab === 'chat') navigate('/chat')
    else if (tab === 'map') navigate('/map')
    else if (tab === 'plans') navigate('/plans')
    else if (tab === 'profile') navigate('/profile')
  }

  const handleBack = () => {
    navigate('/profile/requests')
  }

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <RequestsTopBar title={t('requestDetail.title')} onBack={handleBack} />
        <main className={styles.scrollArea}>
          <div className={styles.loadingWrapper} aria-busy="true">
            <span className={styles.spinner} aria-hidden="true" />
          </div>
        </main>
        <BottomNavigation activeTab="profile" onTabChange={handleTabChange} />
      </div>
    )
  }

  if (!request) {
    return (
      <div className={styles.pageWrapper}>
        <RequestsTopBar title={t('requestDetail.title')} onBack={handleBack} />
        <main className={styles.scrollArea}>
          <div className={styles.notFoundWrapper}>
            <h2 className={styles.notFoundTitle}>{t('requestDetail.notFoundTitle')}</h2>
            <p className={styles.notFoundDescription}>{t('requestDetail.notFoundDescription')}</p>
            <button
              type="button"
              className={styles.backToRequestsBtn}
              onClick={handleBack}
            >
              <span>{t('requestDetail.backToRequests')}</span>
            </button>
          </div>
        </main>
        <BottomNavigation activeTab="profile" onTabChange={handleTabChange} />
      </div>
    )
  }

  const statusLabel = t(`userRequests.status.${request.status}`)

  const statusDescription =
    request.status === 'approved'
      ? t('requestDetail.statusApprovedDesc')
      : request.status === 'rejected'
        ? t('requestDetail.statusRejectedDesc')
        : t('requestDetail.statusPendingDesc')

  const categoryLabel = request.category
    ? t(`createEvent.categories.${request.category}`)
    : '—'

  const datetimeFormatted = request.date
    ? formatEventDateTimeRange(request.date, request.startTime, request.endTime, i18n.language)
    : '—'

  const submittedFormatted = request.createdAt
    ? formatSubmissionDate(request.createdAt, i18n.language)
    : '—'

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Header */}
      <RequestsTopBar
        title={t('requestDetail.title')}
        onBack={handleBack}
      />

      {/* 2. Scrollable Body */}
      <main className={styles.scrollArea} aria-label={request.title}>
        {/* Section 1: Status Banner */}
        <section className={styles.card} aria-label={t('requestDetail.statusTitle')}>
          <div className={styles.statusHeader}>
            <span className={styles.sectionLabel}>{t('requestDetail.statusTitle')}</span>
            <span className={`${styles.statusBadge} ${styles[request.status]}`}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span>{statusLabel}</span>
            </span>
          </div>
          <p className={styles.statusDescription}>{statusDescription}</p>
        </section>

        {/* Section 2: Event Details */}
        <section className={styles.card} aria-label={t('requestDetail.detailsTitle')}>
          <h2 className={styles.cardTitle}>{t('requestDetail.detailsTitle')}</h2>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('requestDetail.titleLabel')}</span>
            <span className={styles.detailValuePrimary}>{request.title}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('requestDetail.categoryLabel')}</span>
            <span className={styles.detailValue}>{categoryLabel}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('requestDetail.datetimeLabel')}</span>
            <span className={styles.detailValue}>{datetimeFormatted}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('requestDetail.locationLabel')}</span>
            <span className={styles.detailValue}>{request.address}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('requestDetail.descriptionLabel')}</span>
            <span className={styles.detailValueDescription}>{request.description}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('requestDetail.submittedLabel')}</span>
            <span className={styles.detailValue}>{submittedFormatted}</span>
          </div>

          <div className={styles.noticeBadge}>
            <IconTicket size={16} color="#059669" />
            <span>{t('requestDetail.freeNotice')}</span>
          </div>
        </section>

        {/* Section 3: Review Result */}
        <section className={styles.card} aria-label={t('requestDetail.reviewResultTitle')}>
          <h2 className={styles.cardTitle}>{t('requestDetail.reviewResultTitle')}</h2>
          <p className={styles.reviewResultText}>{t('requestDetail.reviewResultPending')}</p>
        </section>

        {/* Section 4: Chat / Support Placeholder */}
        <section className={styles.card} aria-label={t('requestDetail.chatTitle')}>
          <div className={styles.chatHeader}>
            <div className={styles.chatTitleRow}>
              <div className={styles.chatIconTile} aria-hidden="true">
                <IconChat size={18} color="#2563EB" />
              </div>
              <h2 className={styles.cardTitle}>{t('requestDetail.chatTitle')}</h2>
            </div>
            <span className={styles.comingSoonBadge}>
              {t('requestDetail.chatComingSoon')}
            </span>
          </div>
          <p className={styles.chatDescription}>{t('requestDetail.chatText')}</p>
        </section>
      </main>

      {/* 3. Bottom Navigation */}
      <BottomNavigation
        activeTab="profile"
        onTabChange={handleTabChange}
      />
    </div>
  )
}
