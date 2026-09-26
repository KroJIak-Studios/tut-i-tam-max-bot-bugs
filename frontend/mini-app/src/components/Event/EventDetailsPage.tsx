import React, { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { findEventById } from '../../services/eventService'
import { useAttendance } from '../../context/useAttendance'
import { useReviews } from '../../context/useReviews'
import { useUserPreferences } from '../../context/useUserPreferences'
import { formatEventDateTime, formatPrice } from '../../utils/formatters'
import {
  IconChevronLeft,
  IconCalendar,
  IconClock,
  IconLocationPin,
  IconUsers,
  IconCheck,
  IconStar,
  IconChat,
} from '../Icons'
import { ConfirmRemoveModal } from '../Plans/ConfirmRemoveModal'
import { ReviewModal } from '../Plans/ReviewModal'
import { BottomNavigation } from '../BottomNavigation'
import type { MapEvent, NavTabId } from '../../types'
import type { PastEvent } from '../../mocks/plansData'
import styles from './EventDetailsPage.module.css'

export const EventDetailsPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()

  const { isGoing, toggleAttendance, removeAttendance } = useAttendance()
  const { getReview, submitReview } = useReviews()
  const { preferences } = useUserPreferences()

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const galleryRef = useRef<HTMLDivElement>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur))
    }, 2800)
  }

  const handleTabChange = (tab: NavTabId) => {
    switch (tab) {
      case 'home':
        navigate('/')
        break
      case 'chat':
        navigate('/chat')
        break
      case 'map':
        navigate('/map')
        break
      case 'plans':
        navigate('/plans')
        break
      case 'profile':
        navigate('/profile')
        break
    }
  }

  // Lookup event
  const event = eventId ? findEventById(eventId) : null

  // Fallback / Not found
  if (!event) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.topBarWrapper}>
          <div className={styles.topBar}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => navigate('/map')}
              aria-label={t('common.back')}
            >
              <IconChevronLeft size={20} color="currentColor" />
              <span>{t('common.back')}</span>
            </button>
            <h1 className={styles.pageTitle}>{t('eventDetails.title')}</h1>
            <div className={styles.topBarSpacer} />
          </div>
        </header>

        <main className={styles.scrollArea}>
          <div className={styles.notFoundContainer}>
            <IconCalendar size={48} color="#94A3B8" />
            <h2 className={styles.notFoundTitle}>{t('eventDetails.notFoundTitle')}</h2>
            <p className={styles.notFoundText}>
              {t('eventDetails.notFoundDescription')}
            </p>
            <button
              type="button"
              className={styles.notFoundBtn}
              onClick={() => navigate('/map')}
            >
              {t('eventDetails.backToMap')}
            </button>
          </div>
        </main>

        <BottomNavigation
          activeTab="none"
          onTabChange={handleTabChange}
        />
      </div>
    )
  }

  const going = isGoing(event.id)
  const userReview = getReview(event.id)

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/map')
    }
  }

  const handleGalleryScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const width = target.clientWidth
    if (width > 0) {
      const idx = Math.round(target.scrollLeft / width)
      if (idx !== currentImageIndex) {
        setCurrentImageIndex(idx)
      }
    }
  }

  const handleToggleAttendance = async () => {
    if (going) {
      setIsRemoveModalOpen(true)
    } else {
      try {
        await toggleAttendance(event.id)
        showToast(t('eventDetails.addedToPlansToast'))
      } catch (err) {
        console.error('Failed to attend:', err)
        showToast(t('plans.updateErrorToast'))
      }
    }
  }

  const handleConfirmRemove = async () => {
    try {
      await removeAttendance(event.id)
      setIsRemoveModalOpen(false)
      showToast(t('plans.removedToast'))
    } catch (err) {
      console.error('Failed to remove attendance:', err)
      showToast(t('plans.updateErrorToast'))
    }
  }

  const handleReviewSubmit = (id: string, rating: number, comment: string) => {
    submitReview(id, rating, comment)
    setIsReviewModalOpen(false)
    showToast(t('plans.reviewThanksToast'))
  }

  const handleOpenEventChat = () => {
    showToast(t('chat.eventChatToast'))
  }

  // External Maps URLs
  const yandexMapsUrl = `https://yandex.ru/maps/?pt=${event.longitude},${event.latitude}&z=16&text=${encodeURIComponent(event.title)}`
  const dgisUrl = `https://2gis.ru/geo/${event.longitude},${event.latitude}`

  const handleOpenPreferredMap = () => {
    const provider = preferences.defaultMapProvider || 'yandex'
    if (provider === '2gis') {
      window.open(dgisUrl, '_blank', 'noopener,noreferrer')
    } else {
      window.open(yandexMapsUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const rawPastDate = event.visitedDate
    ? event.visitedDate.replace(/^Были\s+/i, '')
    : event.date
  const formattedPastDate = formatEventDateTime(rawPastDate, undefined, i18n.language)

  const displayDateText = event.isPast
    ? t('plans.visitedOn', { date: formattedPastDate })
    : formatEventDateTime(event.date, event.startTime, i18n.language)

  // Combine user review + initial reviews for display
  const allReviews = [...event.reviews]
  const totalReviewsCount = allReviews.length + (userReview ? 1 : 0)

  return (
    <div className={styles.pageContainer}>
      {/* 1. Detail Top Bar (Sticky, tinted background) */}
      <header className={styles.topBarWrapper}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleBack}
            aria-label={t('common.back')}
          >
            <IconChevronLeft size={20} color="currentColor" />
            <span>{t('common.back')}</span>
          </button>
          <h1 className={styles.pageTitle}>{t('eventDetails.title')}</h1>
          <div className={styles.topBarSpacer} />
        </div>
      </header>

      {/* 2. Scrollable Content */}
      <main className={styles.scrollArea}>
        {/* Photo Gallery */}
        <div className={styles.galleryWrapper}>
          <div
            ref={galleryRef}
            className={styles.gallerySlider}
            onScroll={handleGalleryScroll}
          >
            {event.images.map((imgSrc, idx) => (
              <div key={idx} className={styles.gallerySlide}>
                <img
                  src={imgSrc}
                  alt={`${event.title} — фото ${idx + 1}`}
                  className={styles.galleryImage}
                />
              </div>
            ))}
          </div>

          {event.images.length > 1 && (
            <div className={styles.galleryDots} aria-hidden="true">
              {event.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`${styles.dot} ${idx === currentImageIndex ? styles.dotActive : ''}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className={styles.content}>
          {/* Header & Badges */}
          <div className={styles.headerSection}>
            <h1 className={styles.eventTitle}>{event.title}</h1>

            <div className={styles.metaRow}>
              {/* Date */}
              <div className={styles.metaPill}>
                <IconClock size={13} color="currentColor" />
                <span>{displayDateText}</span>
              </div>

              {/* Price */}
              <div
                className={`${styles.metaPill} ${
                  event.isFree || event.price === 0 ? styles.metaPillFree : styles.metaPillPrimary
                }`}
              >
                <span>{event.isFree || event.price === 0 ? t('events.free') : formatPrice(event.price, i18n.language)}</span>
              </div>

              {/* Pushkin Card */}
              {event.pushkinCard && (
                <div className={`${styles.metaPill} ${styles.metaPillPushkin}`}>
                  <span>{t('events.pushkinCard')}</span>
                </div>
              )}

              {/* Attendees */}
              <div className={styles.metaPill}>
                <IconUsers size={13} color="currentColor" />
                <span>{t('events.attendeesCount', { count: event.attendeesCount })}</span>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className={styles.card}>
            <h2 className={styles.cardSectionTitle}>{t('eventDetails.description')}</h2>
            <p className={styles.descriptionText}>{event.description}</p>
          </div>

          {/* Attendance Action or Past Event Status */}
          <div className={styles.card}>
            {event.isPast ? (
              <div className={styles.pastStatusBox}>
                <div className={styles.pastVisitedBanner}>
                  <IconCheck size={16} color="#166534" />
                  <span>{t('plans.visitedOn', { date: formattedPastDate })}</span>
                </div>

                {userReview ? (
                  <div className={styles.userReviewBadge}>
                    <div className={styles.userReviewTop}>
                      <span className={styles.userReviewTitle}>{t('reviews.yourReview')}</span>
                      <div className={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <IconStar
                            key={star}
                            size={14}
                            color={star <= userReview.rating ? '#F59E0B' : '#D1D5DB'}
                            filled={star <= userReview.rating}
                          />
                        ))}
                      </div>
                    </div>
                    {userReview.comment && (
                      <p className={styles.userReviewComment}>«{userReview.comment}»</p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.pastReviewBtn}
                    onClick={() => setIsReviewModalOpen(true)}
                  >
                    <IconStar size={16} color="#2563EB" filled={false} />
                    <span>{t('plans.leaveReview')}</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                className={`${styles.attendanceBtn} ${
                  going ? styles.attendanceBtnGoing : styles.attendanceBtnJoin
                }`}
                onClick={handleToggleAttendance}
              >
                {going ? (
                  <>
                    <IconCheck size={18} color="#FFFFFF" />
                    <span>{t('events.youreGoing')}</span>
                  </>
                ) : (
                  <span>{t('events.imGoing')}</span>
                )}
              </button>
            )}
          </div>

          {/* Location & External Maps */}
          <div className={styles.card}>
            <h2 className={styles.cardSectionTitle}>{t('eventDetails.location')}</h2>
            <div className={styles.locationBox}>
              <div className={styles.locationAddressRow}>
                <IconLocationPin size={18} className={styles.locationPin} />
                <span>{event.address}</span>
              </div>

              {/* In-app navigation to map (only for active/upcoming events) */}
              {!event.isPast && (
                <button
                  type="button"
                  className={styles.onMapAppBtn}
                  onClick={() => navigate(`/map?event=${event.id}`)}
                >
                  <IconLocationPin size={15} color="currentColor" />
                  <span>{t('eventDetails.showOnMap')}</span>
                </button>
              )}

              {/* Preferred Map Provider Button */}
              <button
                type="button"
                className={styles.openPreferredMapBtn}
                onClick={handleOpenPreferredMap}
              >
                <span>{t('eventDetails.openInPreferredMap', { provider: preferences.defaultMapProvider === '2gis' ? (i18n.language.startsWith('en') ? '2GIS' : '2ГИС') : (i18n.language.startsWith('en') ? 'Yandex Maps' : 'Яндекс Картах') })}</span>
              </button>

              {/* External Maps Links */}
              <div className={styles.mapsActionsGrid}>
                <a
                  href={yandexMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapActionBtn}
                >
                  <span>{i18n.language.startsWith('en') ? 'Yandex Maps ↗' : 'Яндекс Карты ↗'}</span>
                </a>
                <a
                  href={dgisUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapActionBtn}
                >
                  <span>{i18n.language.startsWith('en') ? '2GIS ↗' : '2ГИС ↗'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Event Chat */}
          <div className={styles.card}>
            <button
              type="button"
              className={styles.eventChatBtn}
              onClick={handleOpenEventChat}
            >
              <IconChat size={18} color="currentColor" />
              <span>{t('chat.eventChat')}</span>
            </button>
          </div>

          {/* Reviews List */}
          <div className={styles.card}>
            <h2 className={styles.cardSectionTitle}>
              {totalReviewsCount > 0
                ? `${t('reviews.title')} (${t('reviews.count', { count: totalReviewsCount })})`
                : t('reviews.title')}
            </h2>

            <div className={styles.reviewsList}>
              {/* Display user review at top if submitted */}
              {userReview && (
                <div className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewUserRow}>
                      <div className={styles.reviewAvatar}>{t('reviews.you')}</div>
                      <div className={styles.reviewMeta}>
                        <span className={styles.reviewUserName}>{t('reviews.yourReview')}</span>
                        <span className={styles.reviewDate}>
                          {userReview.dateText === 'сегодня' ? t('dates.today') : (userReview.dateText || t('dates.today'))}
                        </span>
                      </div>
                    </div>
                    <div className={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <IconStar
                          key={star}
                          size={14}
                          color={star <= userReview.rating ? '#F59E0B' : '#D1D5DB'}
                          filled={star <= userReview.rating}
                        />
                      ))}
                    </div>
                  </div>
                  {userReview.comment && (
                    <p className={styles.reviewText}>{userReview.comment}</p>
                  )}
                </div>
              )}

              {/* Mock / existing reviews */}
              {allReviews.map((rev) => (
                <div key={rev.id} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewUserRow}>
                      <div className={styles.reviewAvatar}>
                        {rev.userName ? rev.userName[0].toUpperCase() : 'У'}
                      </div>
                      <div className={styles.reviewMeta}>
                        <span className={styles.reviewUserName}>{rev.userName}</span>
                        <span className={styles.reviewDate}>{rev.dateText}</span>
                      </div>
                    </div>
                    <div className={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <IconStar
                          key={star}
                          size={14}
                          color={star <= rev.rating ? '#F59E0B' : '#D1D5DB'}
                          filled={star <= rev.rating}
                        />
                      ))}
                    </div>
                  </div>
                  <p className={styles.reviewText}>{rev.text}</p>
                </div>
              ))}

              {!userReview && allReviews.length === 0 && (
                <div className={styles.emptyReviews}>
                  {t('reviews.noReviewsYet')}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="none"
        onTabChange={handleTabChange}
      />

      {/* Action Modals */}
      <ConfirmRemoveModal
        event={
          isRemoveModalOpen
            ? ({
                id: event.id,
                title: event.title,
              } as MapEvent)
            : null
        }
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onConfirm={handleConfirmRemove}
      />

      <ReviewModal
        event={
          isReviewModalOpen
            ? ({
                id: event.id,
                title: event.title,
              } as PastEvent)
            : null
        }
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toast} role="status">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
