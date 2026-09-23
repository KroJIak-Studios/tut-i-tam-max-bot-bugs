import React, { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { findEventById } from '../../services/eventService'
import { useAttendance } from '../../context/useAttendance'
import { useReviews } from '../../context/useReviews'
import { useUserPreferences } from '../../context/useUserPreferences'
import { formatEventDateTime } from '../../utils/dateUtils'
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
              aria-label="Назад к карте"
            >
              <IconChevronLeft size={20} color="currentColor" />
              <span>Назад</span>
            </button>
            <h1 className={styles.pageTitle}>Событие</h1>
            <div className={styles.topBarSpacer} />
          </div>
        </header>

        <main className={styles.scrollArea}>
          <div className={styles.notFoundContainer}>
            <IconCalendar size={48} color="#94A3B8" />
            <h2 className={styles.notFoundTitle}>Событие не найдено</h2>
            <p className={styles.notFoundText}>
              Возможно, мероприятие было перенесено, удалено или ссылка содержит опечатку.
            </p>
            <button
              type="button"
              className={styles.notFoundBtn}
              onClick={() => navigate('/map')}
            >
              На карту
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
        showToast('Добавлено в ваши планы!')
      } catch (err) {
        console.error('Failed to attend:', err)
        showToast('Не удалось обновить планы')
      }
    }
  }

  const handleConfirmRemove = async () => {
    try {
      await removeAttendance(event.id)
      setIsRemoveModalOpen(false)
      showToast('Удалено из ваших планов')
    } catch (err) {
      console.error('Failed to remove attendance:', err)
      showToast('Не удалось обновить планы')
    }
  }

  const handleReviewSubmit = (id: string, rating: number, comment: string) => {
    submitReview(id, rating, comment)
    setIsReviewModalOpen(false)
    showToast('Спасибо за ваш отзыв!')
  }

  const handleOpenEventChat = () => {
    showToast('Чат события появится позже')
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

  const displayDateText = event.isPast
    ? event.visitedDate || `Было ${event.date}`
    : formatEventDateTime(event.date, event.startTime)

  // Combine user review + initial reviews for display
  const allReviews = [...event.reviews]

  return (
    <div className={styles.pageContainer}>
      {/* 1. Detail Top Bar (Sticky, tinted background) */}
      <header className={styles.topBarWrapper}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleBack}
            aria-label="Назад"
          >
            <IconChevronLeft size={20} color="currentColor" />
            <span>Назад</span>
          </button>
          <h1 className={styles.pageTitle}>Событие</h1>
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
                <span>{event.isFree || event.price === 0 ? 'Бесплатно' : `${event.price} ₽`}</span>
              </div>

              {/* Pushkin Card */}
              {event.pushkinCard && (
                <div className={`${styles.metaPill} ${styles.metaPillPushkin}`}>
                  <span>Пушкинская карта</span>
                </div>
              )}

              {/* Attendees */}
              <div className={styles.metaPill}>
                <IconUsers size={13} color="currentColor" />
                <span>{event.attendeesCount} идут</span>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className={styles.card}>
            <h2 className={styles.cardSectionTitle}>Описание</h2>
            <p className={styles.descriptionText}>{event.description}</p>
          </div>

          {/* Attendance Action or Past Event Status */}
          <div className={styles.card}>
            {event.isPast ? (
              <div className={styles.pastStatusBox}>
                <div className={styles.pastVisitedBanner}>
                  <IconCheck size={16} color="#166534" />
                  <span>Посещено {event.visitedDate ? event.visitedDate.replace(/^Были\s+/i, '') : event.date}</span>
                </div>

                {userReview ? (
                  <div className={styles.userReviewBadge}>
                    <div className={styles.userReviewTop}>
                      <span className={styles.userReviewTitle}>Ваш отзыв</span>
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
                    <span>Оставить отзыв</span>
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
                    <span>Вы идёте</span>
                  </>
                ) : (
                  <span>Я приду</span>
                )}
              </button>
            )}
          </div>

          {/* Location & External Maps */}
          <div className={styles.card}>
            <h2 className={styles.cardSectionTitle}>Место</h2>
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
                  <span>Показать на карте приложения</span>
                </button>
              )}

              {/* Preferred Map Provider Button */}
              <button
                type="button"
                className={styles.openPreferredMapBtn}
                onClick={handleOpenPreferredMap}
              >
                <span>Открыть в {preferences.defaultMapProvider === '2gis' ? '2ГИС' : 'Яндекс Картах'} ↗</span>
              </button>

              {/* External Maps Links */}
              <div className={styles.mapsActionsGrid}>
                <a
                  href={yandexMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapActionBtn}
                >
                  <span>Яндекс Карты ↗</span>
                </a>
                <a
                  href={dgisUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapActionBtn}
                >
                  <span>2ГИС ↗</span>
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
              <span>Чат события</span>
            </button>
          </div>

          {/* Reviews List */}
          <div className={styles.card}>
            <h2 className={styles.cardSectionTitle}>
              Отзывы {allReviews.length > 0 ? `(${allReviews.length + (userReview ? 1 : 0)})` : ''}
            </h2>

            <div className={styles.reviewsList}>
              {/* Display user review at top if submitted */}
              {userReview && (
                <div className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewUserRow}>
                      <div className={styles.reviewAvatar}>Вы</div>
                      <div className={styles.reviewMeta}>
                        <span className={styles.reviewUserName}>Ваш отзыв</span>
                        <span className={styles.reviewDate}>{userReview.dateText || 'сегодня'}</span>
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
                  Пока нет отзывов. Станьте первым!
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
