import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cancelOwnEvent, connectEventChat, getEventById, submitEventReview } from '../../services/eventService'
import { ApiError } from '../../services/api'
import { useAttendance } from '../../context/useAttendance'
import { useReviews } from '../../context/useReviews'
import { formatEventDateTime, formatEventDateTimeRange, formatPrice } from '../../utils/formatters'
import { getEventStartDate } from '../../utils/eventTime'
import { isEventActiveAt } from '../../utils/eventTime'
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
import { EventPhoto } from '../EventPhoto'
import type { MapEvent, NavTabId } from '../../types'
import type { PastEvent } from '../../mocks/plansData'
import styles from './EventDetailsPage.module.css'

export const EventDetailsPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()

  const { isGoing, toggleAttendance, removeAttendance } = useAttendance()
  const { getReview, submitReview } = useReviews()

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [chatUrl, setChatUrl] = useState('')
  const [chatMessage, setChatMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [chatSaving, setChatSaving] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [event, setEvent] = useState<Awaited<ReturnType<typeof getEventById>> | null>(null)
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    getEventById(eventId).then((item) => {
      setEvent(item)
      setChatUrl(item.chatInviteUrl || '')
      setChatMessage(item.chatConnected ? { ok: true, text: '' } : null)
    }).catch(() => setEvent(null)).finally(() => setLoading(false))
  }, [eventId])

  if (loading) return <div className={styles.pageContainer} />
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
    void submitEventReview(id, rating, comment)
    submitReview(id, rating, comment)
    setIsReviewModalOpen(false)
    showToast(t('plans.reviewThanksToast'))
  }

  const connectChat = async () => {
    if (!event || chatSaving) return
    setChatSaving(true)
    try {
      await connectEventChat(event.id, chatUrl.trim())
      setEvent({ ...event, chatConnected: true, chatInviteUrl: chatUrl.trim() })
      setChatMessage({ ok: true, text: t('eventDetails.owner.connected') })
    } catch (error) {
      const detail = error instanceof ApiError ? error.detail : undefined
      const text = detail === 'chat_already_used'
        ? t('eventDetails.owner.alreadyUsed')
        : t('eventDetails.owner.invalidLink')
      setChatMessage({ ok: false, text })
    } finally {
      setChatSaving(false)
    }
  }

  const confirmCancelEvent = async () => {
    if (!event) return
    await cancelOwnEvent(event.id)
    navigate('/plans')
  }

  // External Maps URLs
  const yandexMapsUrl = `https://yandex.ru/maps/?ll=${event.longitude},${event.latitude}&pt=${event.longitude},${event.latitude}&z=16`
  const dgisUrl = `https://2gis.ru/geo/${event.longitude}%2C${event.latitude}?m=${event.longitude}%2C${event.latitude}%2F16`

  const rawPastDate = event.visitedDate
    ? event.visitedDate.replace(/^Были\s+/i, '')
    : event.date
  const formattedPastDate = formatEventDateTime(rawPastDate, undefined, i18n.language)

  const displayDateText = event.isPast
    ? t('plans.visitedOn', { date: formattedPastDate })
    : formatEventDateTimeRange(event, i18n.language)

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
                <EventPhoto src={imgSrc} />
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
              {/* Happening now badge */}
              {!event.isPast && isEventActiveAt(event, new Date()) && (
                <div className={`${styles.metaPill} ${styles.metaPillFree}`}>
                  <span>{t('events.happeningNow', 'Идёт сейчас')}</span>
                </div>
              )}

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
            ) : event.owned ? (
              <button type="button" className={styles.cancelEventBtn} onClick={() => setCancelOpen(true)}>
                {t('eventDetails.owner.cancelEvent')}
              </button>
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
                  onClick={() => navigate(`/map?event=${event.id}&date=${getEventStartDate(event)}&lat=${event.latitude}&lng=${event.longitude}`)}
                >
                  <IconLocationPin size={15} color="currentColor" />
                  <span>{t('eventDetails.showOnMap')}</span>
                </button>
              )}

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

          {(event.owned || (event.chatConnected && event.chatInviteUrl)) && (
          <div className={styles.card}>
            {event.owned ? (
              <div className={styles.chatLinkBox}>
                <h2 className={styles.cardSectionTitle}>{t('eventDetails.owner.chatTitle')}</h2>
                <p className={styles.chatHelp}>{t('eventDetails.owner.chatHelp')}</p>
                <div className={styles.chatLinkRow}>
                  <input value={chatUrl} onChange={(item) => setChatUrl(item.target.value)} placeholder="https://max.ru/join/..." />
                  <button type="button" onClick={() => void connectChat()} disabled={chatSaving || !chatUrl.trim()}>{chatSaving ? t('eventDetails.owner.connecting') : t('eventDetails.owner.connect')}</button>
                </div>
                {chatMessage?.text && (
                  <div className={chatMessage.ok ? styles.chatSuccess : styles.chatMissing} role="status">
                    {chatMessage.text}
                  </div>
                )}
              </div>
            ) : event.chatConnected && event.chatInviteUrl ? (
              <a className={styles.eventChatBtn} href={event.chatInviteUrl} target="_blank" rel="noopener noreferrer">
                <IconChat size={18} color="currentColor" />
                <span>{t('chat.eventChat')}</span>
              </a>
            ) : null}
          </div>
          )}

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
                  {event.isPast ? t('reviews.noReviewsYet') : t('reviews.beforeEvent')}
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

      {cancelOpen && (
        <div className={styles.confirmOverlay} role="dialog" aria-modal="true" onClick={() => setCancelOpen(false)}>
          <div className={styles.confirmSheet} onClick={(item) => item.stopPropagation()}>
            <h3>{t('eventDetails.owner.cancelTitle')}</h3>
            <p>{t('eventDetails.owner.cancelDescription', { title: event.title })}</p>
            <div className={styles.confirmActions}>
              <button type="button" onClick={() => setCancelOpen(false)}>{t('common.cancel')}</button>
              <button type="button" className={styles.confirmDanger} onClick={() => void confirmCancelEvent()}>{t('eventDetails.owner.cancelConfirm')}</button>
            </div>
          </div>
        </div>
      )}

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
