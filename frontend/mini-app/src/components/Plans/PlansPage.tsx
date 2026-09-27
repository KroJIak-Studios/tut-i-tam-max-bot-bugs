import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { MapEvent, NavTabId } from '../../types'
import { useAttendance } from '../../context/useAttendance'
import { useReviews } from '../../context/useReviews'
import type { PastEvent } from '../../mocks/plansData'
import { PlansTopBar } from './PlansTopBar'
import { PlansSegmentControl, type PlansTab } from './PlansSegmentControl'
import { PlanEventCard } from './PlanEventCard'
import { PastEventCard } from './PastEventCard'
import { PlansEmptyState } from './PlansEmptyState'
import { PlansSkeleton } from './PlansSkeleton'
import { ConfirmRemoveModal } from './ConfirmRemoveModal'
import { ReviewModal } from './ReviewModal'
import { BottomNavigation } from '../BottomNavigation'
import styles from './PlansPage.module.css'

export const PlansPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { goingEvents, loading, removeAttendance } = useAttendance()
  const { pastEvents, submitReview } = useReviews()

  const [activeSegment, setActiveSegment] = useState<PlansTab>('going')

  // Modals state
  const [removeTargetEvent, setRemoveTargetEvent] = useState<MapEvent | null>(null)
  const [reviewTargetEvent, setReviewTargetEvent] = useState<PastEvent | null>(null)

  // Lightweight Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 2800)
  }

  // Navigation handlers
  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') {
      navigate('/')
    } else if (tab === 'chat') {
      navigate('/chat')
    } else if (tab === 'map') {
      navigate('/map')
    } else if (tab === 'profile') {
      navigate('/profile')
    }
  }

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`)
  }

  // Removal confirmation
  const handleConfirmRemove = async (event: MapEvent) => {
    try {
      await removeAttendance(event.id)
      showToast(t('plans.removedToast'))
    } catch (err) {
      console.error('Failed to remove event from plans:', err)
      showToast(t('plans.updateErrorToast'))
    }
  }

  // Review submission
  const handleReviewSubmit = (eventId: string, rating: number, comment: string) => {
    submitReview(eventId, rating, comment)
    showToast(t('plans.reviewThanksToast'))
  }

  return (
    <div className={styles.pageContainer}>
      {/* 1. Header */}
      <PlansTopBar />

      {/* 2. Main Scroll Area */}
      <main className={styles.scrollArea}>
        <div className={styles.contentWrapper}>
          {/* Segmented control: [ Иду ] [ Были ] */}
          <PlansSegmentControl
            activeTab={activeSegment}
            onChange={setActiveSegment}
            goingCount={goingEvents.length}
            pastCount={pastEvents.length}
          />

          {/* Toast alert if active */}
          {toastMessage && (
            <div className={styles.toast} role="status">
              <span>{toastMessage}</span>
            </div>
          )}

          {/* List Content */}
          <div className={styles.listSection}>
            {loading ? (
              <PlansSkeleton />
            ) : activeSegment === 'going' ? (
              goingEvents.length > 0 ? (
                <div className={styles.cardsList}>
                  {goingEvents.map((evt) => (
                    <PlanEventCard
                      key={evt.id}
                      event={evt}
                      onClick={handleEventClick}
                      onRequestRemove={setRemoveTargetEvent}
                    />
                  ))}
                </div>
              ) : (
                <PlansEmptyState
                  type="going"
                  onOpenMap={() => navigate('/map')}
                  onOpenChat={() => navigate('/chat')}
                />
              )
            ) : pastEvents.length > 0 ? (
              <div className={styles.cardsList}>
                {pastEvents.map((evt) => (
                  <PastEventCard
                    key={evt.id}
                    event={evt}
                    onClick={handleEventClick}
                    onOpenReview={setReviewTargetEvent}
                  />
                ))}
              </div>
            ) : (
              <PlansEmptyState
                type="past"
                onOpenMap={() => navigate('/map')}
                onOpenChat={() => navigate('/chat')}
              />
            )}
          </div>
        </div>
      </main>

      {/* 3. Bottom Navigation (Планы active) */}
      <BottomNavigation activeTab="plans" onTabChange={handleTabChange} />

      {/* 4. Action Modals */}
      <ConfirmRemoveModal
        event={removeTargetEvent}
        isOpen={Boolean(removeTargetEvent)}
        onClose={() => setRemoveTargetEvent(null)}
        onConfirm={handleConfirmRemove}
      />

      <ReviewModal
        event={reviewTargetEvent}
        isOpen={Boolean(reviewTargetEvent)}
        onClose={() => setReviewTargetEvent(null)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  )
}
