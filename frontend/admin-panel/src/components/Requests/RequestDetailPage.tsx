import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { moderationApi } from '../../features/moderation/api/moderationApi'
import { dispatchModerationUpdated } from '../../features/moderation/hooks/useModerationCounts'
import type { ModerationEventCard, ModerationStatus } from '../../features/moderation/types'
import {
  getModerationStatusLabel,
  formatTimeAgo,
  formatDateTime,
  formatDateRange,
} from '../../utils/moderationFormatters'
import { RequestLocationMap } from './RequestLocationMap'
import styles from './RequestDetailPage.module.css'

// ────────────────────────────────────────────────────────────────
// Action modal: collect required text (comment / reason) before submit
// ────────────────────────────────────────────────────────────────

interface ActionModalProps {
  action: 'reject' | 'changes_requested'
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (text: string) => void
}

const ActionModal: React.FC<ActionModalProps> = ({
  action,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  const [text, setText] = useState('')
  const isEmpty = text.trim().length === 0

  const title =
    action === 'reject' ? 'Отклонить заявку' : 'Запросить доработку'
  const placeholder =
    action === 'reject'
      ? 'Укажите причину отклонения...'
      : 'Опишите, что нужно исправить или дополнить...'
  const submitLabel = action === 'reject' ? 'Отклонить' : 'Отправить замечания'

  // Trap focus + close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={styles.modalBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Закрыть"
            disabled={isSubmitting}
          >
            <XCircle size={18} />
          </button>
        </header>

        <div className={styles.modalBody}>
          <label className={styles.modalLabel} htmlFor="action-text">
            {action === 'reject' ? 'Причина отклонения' : 'Замечания для автора'}
            <span className={styles.required}> *</span>
          </label>
          <textarea
            id="action-text"
            className={styles.modalTextarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={4}
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        <footer className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            type="button"
            className={action === 'reject' ? styles.btnDanger : styles.btnWarning}
            onClick={() => onConfirm(text)}
            disabled={isEmpty || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className={styles.btnSpinner} />
                <span>Отправка...</span>
              </>
            ) : (
              submitLabel
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Status badge
// ────────────────────────────────────────────────────────────────

function getStatusClass(status: ModerationStatus): string {
  switch (status) {
    case 'pending':
      return styles.statusPending
    case 'approved':
      return styles.statusApproved
    case 'rejected':
      return styles.statusRejected
    case 'changes_requested':
      return styles.statusChanges
    default:
      return ''
  }
}

// ────────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────────

export const RequestDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()

  const [event, setEvent] = useState<ModerationEventCard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Action state
  const [activeModal, setActiveModal] = useState<'reject' | 'changes_requested' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!requestId) return
    const id = Number(requestId)
    if (isNaN(id)) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await moderationApi.getEvent(id)
      setEvent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить заявку')
    } finally {
      setIsLoading(false)
    }
  }, [requestId])

  useEffect(() => {
    load()
  }, [load])

  // Auto-clear success message after 4 seconds
  useEffect(() => {
    if (!successMsg) return
    const timer = setTimeout(() => setSuccessMsg(null), 4000)
    return () => clearTimeout(timer)
  }, [successMsg])

  const handleApprove = async () => {
    if (!event) return
    setIsSubmitting(true)
    setActionError(null)
    try {
      const updated = await moderationApi.approve(event.id)
      setEvent(updated)
      setSuccessMsg('Заявка одобрена')
      dispatchModerationUpdated()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Ошибка при одобрении')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModalConfirm = async (text: string) => {
    if (!event || !activeModal) return
    setIsSubmitting(true)
    setActionError(null)

    try {
      let updated: ModerationEventCard
      if (activeModal === 'reject') {
        updated = await moderationApi.reject(event.id, { reason: text })
        setSuccessMsg('Заявка отклонена')
      } else {
        updated = await moderationApi.requestChanges(event.id, { comment: text })
        setSuccessMsg('Замечания отправлены автору')
      }
      setEvent(updated)
      setActiveModal(null)
      dispatchModerationUpdated()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Ошибка при обработке заявки')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canModerate =
    event?.moderation?.status === 'pending' ||
    event?.moderation?.status === 'changes_requested'

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate('/requests')}
          >
            <ArrowLeft size={16} />
            <span>Все заявки</span>
          </button>
        </div>
        <div className={styles.card}>
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Загрузка заявки...</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Error / Not found ─────────────────────────────────────────
  if (error || !event) {
    return (
      <div className={styles.page}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate('/requests')}
          >
            <ArrowLeft size={16} />
            <span>Все заявки</span>
          </button>
        </div>
        <div className={styles.card}>
          <div className={styles.errorState}>
            <AlertCircle size={28} color="var(--color-danger)" />
            <h2 className={styles.errorTitle}>
              {error ? 'Ошибка загрузки' : 'Заявка не найдена'}
            </h2>
            <p className={styles.errorText}>
              {error ?? `Заявка #${requestId} отсутствует в системе.`}
            </p>
            {error && (
              <button type="button" className={styles.retryBtn} onClick={load}>
                <RefreshCw size={14} />
                <span>Повторить</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const moderation = event.moderation
  const locationPoint =
    event.latitude !== 0 || event.longitude !== 0
      ? { lat: event.latitude, lng: event.longitude }
      : null

  return (
    <div className={styles.page}>
      {/* Top navigation bar */}
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/requests')}
        >
          <ArrowLeft size={16} />
          <span>Все заявки</span>
        </button>

        <div className={styles.topBarRight}>
          <span className={styles.eventIdLabel}>#{event.id}</span>
          {moderation && (
            <span className={`${styles.statusBadge} ${getStatusClass(moderation.status)}`}>
              <span className={styles.statusDot} />
              {getModerationStatusLabel(moderation.status)}
            </span>
          )}
        </div>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className={styles.successBanner} role="status">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Action error */}
      {actionError && (
        <div className={styles.errorBanner} role="alert">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Two-column layout (collapses on mobile) */}
      <div className={styles.twoCol}>
        {/* ── Left column: event details ─────────────────────── */}
        <div className={styles.leftColumn}>
          {/* Main info card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{event.title}</h2>
            </div>

            <p className={styles.description}>{event.description}</p>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <Clock size={14} className={styles.metaIcon} aria-hidden="true" />
                <span className={styles.metaLabel}>Дата</span>
                <span className={styles.metaValue}>
                  {formatDateRange(event.starts_at, event.ends_at)}
                </span>
              </div>

              <div className={styles.metaItem}>
                <MapPin size={14} className={styles.metaIcon} aria-hidden="true" />
                <span className={styles.metaLabel}>Адрес</span>
                <span className={styles.metaValue}>{event.address}</span>
              </div>

              {event.author && (
                <div className={styles.metaItem}>
                  <User size={14} className={styles.metaIcon} aria-hidden="true" />
                  <span className={styles.metaLabel}>Автор</span>
                  <span className={styles.metaValue}>
                    {event.author.first_name}
                    {event.author.last_name ? ` ${event.author.last_name}` : ''}
                    {' '}
                    <span className={styles.metaSecondary}>#{event.author.id}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Event photos */}
            {event.images.length > 0 && (
              <div className={styles.photosRow}>
                {event.images.map((img) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt={`Фото мероприятия #${img.id}`}
                    className={styles.photo}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Location map card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <MapPin size={16} aria-hidden="true" />
                <span>Место проведения</span>
              </h2>
            </div>

            {locationPoint && (
              <RequestLocationMap
                locationMode={event.area ? 'area' : 'point'}
                locationPoint={locationPoint}
                locationArea={event.area ? { points: event.area.map(([lat, lng]) => ({ lat, lng })) } : undefined}
                address={event.address}
              />
            )}
          </div>
        </div>

        {/* ── Right column: moderation workspace ─────────────── */}
        <div className={styles.rightColumn}>
          {/* Moderation metadata */}
          {moderation && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>История модерации</h2>
              </div>

              <div className={styles.moderationMeta}>
                {moderation.submitted_at && (
                  <div className={styles.metaRow}>
                    <span className={styles.metaRowLabel}>Подано</span>
                    <span className={styles.metaRowValue}>
                      {formatDateTime(moderation.submitted_at)}
                      {' '}
                      <span className={styles.timeAgo}>
                        ({formatTimeAgo(moderation.submitted_at)})
                      </span>
                    </span>
                  </div>
                )}

                {moderation.moderated_at && (
                  <div className={styles.metaRow}>
                    <span className={styles.metaRowLabel}>Последнее решение</span>
                    <span className={styles.metaRowValue}>
                      {formatDateTime(moderation.moderated_at)}
                    </span>
                  </div>
                )}

                {moderation.moderated_by && (
                  <div className={styles.metaRow}>
                    <span className={styles.metaRowLabel}>Модератор</span>
                    <span className={styles.metaRowValue}>{moderation.moderated_by}</span>
                  </div>
                )}

                {moderation.comment && (
                  <div className={styles.moderationCommentBlock}>
                    <span className={styles.metaRowLabel}>Комментарий</span>
                    <p className={styles.moderationCommentText}>{moderation.comment}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Decision card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Решение по заявке</h2>
            </div>

            {/* Current status explanation */}
            {moderation?.status === 'pending' && (
              <div className={`${styles.currentStatusBox} ${styles.statusPendingBox}`}>
                <div className={styles.statusBoxHeader}>
                  <Clock size={16} />
                  <span>Ожидает проверки</span>
                </div>
                <p className={styles.statusBoxText}>
                  Заявка ожидает рассмотрения. Ознакомьтесь с описанием и местом
                  проведения, после чего примите решение.
                </p>
              </div>
            )}

            {moderation?.status === 'changes_requested' && (
              <div className={`${styles.currentStatusBox} ${styles.statusChangesBox}`}>
                <div className={styles.statusBoxHeader}>
                  <AlertCircle size={16} />
                  <span>На доработку</span>
                </div>
                {moderation.comment && (
                  <p className={styles.statusBoxText}>
                    <strong>Замечания:</strong> {moderation.comment}
                  </p>
                )}
              </div>
            )}

            {moderation?.status === 'approved' && (
              <div className={`${styles.currentStatusBox} ${styles.statusApprovedBox}`}>
                <div className={styles.statusBoxHeader}>
                  <CheckCircle size={16} />
                  <span>Одобрено — событие опубликовано</span>
                </div>
              </div>
            )}

            {moderation?.status === 'rejected' && (
              <div className={`${styles.currentStatusBox} ${styles.statusRejectedBox}`}>
                <div className={styles.statusBoxHeader}>
                  <XCircle size={16} />
                  <span>Отклонено</span>
                </div>
                {moderation.comment && (
                  <p className={styles.statusBoxText}>
                    <strong>Причина:</strong> {moderation.comment}
                  </p>
                )}
              </div>
            )}

            {/* Action buttons — only when moderation is possible */}
            {canModerate && (
              <div className={styles.actionButtonsGroup}>
                <button
                  type="button"
                  className={styles.btnApprove}
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className={styles.btnSpinner} />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  <span>Одобрить</span>
                </button>

                <button
                  type="button"
                  className={styles.btnChanges}
                  onClick={() => {
                    setActionError(null)
                    setActiveModal('changes_requested')
                  }}
                  disabled={isSubmitting}
                >
                  <AlertCircle size={16} />
                  <span>На доработку</span>
                </button>

                <button
                  type="button"
                  className={styles.btnReject}
                  onClick={() => {
                    setActionError(null)
                    setActiveModal('reject')
                  }}
                  disabled={isSubmitting}
                >
                  <XCircle size={16} />
                  <span>Отклонить</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action modals */}
      {activeModal && (
        <ActionModal
          action={activeModal}
          isSubmitting={isSubmitting}
          onClose={() => setActiveModal(null)}
          onConfirm={handleModalConfirm}
        />
      )}
    </div>
  )
}
