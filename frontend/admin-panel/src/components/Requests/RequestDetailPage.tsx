import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { AdminEventRequest, AdminRequestStatus } from '../../types/request'
import {
  getRequestById,
  approveRequest,
  rejectRequest,
  requestChanges,
} from '../../services/adminRequestsRepository'
import {
  getStatusLabel,
  getCategoryLabel,
  formatDateTimeRange,
  formatDuration,
  formatSubmissionTime,
} from '../../utils/formatters'
import {
  IconArrowLeft,
  IconMapPin,
  IconClock,
  IconUser,
  IconMessageSquare,
  IconCheck,
  IconX,
  IconAlertCircle,
} from '../Icons'
import { RequestLocationMap } from './RequestLocationMap'
import { ModerationConfirmModal } from './ModerationConfirmModal'
import styles from './RequestDetailPage.module.css'

export const RequestDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()

  const [request, setRequest] = useState<AdminEventRequest | null>(null)
  const [loading, setLoading] = useState<boolean>(() => Boolean(requestId))
  const [commentDraft, setCommentDraft] = useState<string>('')
  const [confirmModalStatus, setConfirmModalStatus] =
    useState<AdminRequestStatus | null>(null)

  useEffect(() => {
    let isCurrent = true
    if (!requestId) return

    getRequestById(requestId).then((data) => {
      if (isCurrent) {
        setRequest(data)
        if (data?.moderatorComment) {
          setCommentDraft(data.moderatorComment)
        }
        setLoading(false)
      }
    })

    return () => {
      isCurrent = false
    }
  }, [requestId])

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate('/requests')}
          >
            <IconArrowLeft size={16} />
            <span>Все заявки</span>
          </button>
        </div>
        <div className={styles.card}>
          <p>Загрузка данных заявки...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className={styles.page}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate('/requests')}
          >
            <IconArrowLeft size={16} />
            <span>Все заявки</span>
          </button>
        </div>
        <div className={styles.card}>
          <h2>Заявка не найдена</h2>
          <p>Запрошенная заявка с ID #{requestId} отсутствует в системе.</p>
        </div>
      </div>
    )
  }

  const getStatusBadgeClass = (status: AdminRequestStatus) => {
    switch (status) {
      case 'pending':
        return styles.statusPending
      case 'needs_changes':
        return styles.statusNeedsChanges
      case 'approved':
        return styles.statusApproved
      case 'rejected':
        return styles.statusRejected
      default:
        return ''
    }
  }

  const handleModalConfirm = async (confirmedComment: string) => {
    if (!confirmModalStatus || !requestId) return

    try {
      let updated: AdminEventRequest
      if (confirmModalStatus === 'approved') {
        updated = await approveRequest(requestId, confirmedComment)
      } else if (confirmModalStatus === 'rejected') {
        updated = await rejectRequest(requestId, confirmedComment)
      } else {
        updated = await requestChanges(requestId, confirmedComment)
      }
      setRequest(updated)
      setCommentDraft(updated.moderatorComment || '')
      setConfirmModalStatus(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка обновления статуса')
    }
  }

  const durationStr = formatDuration(
    request.startDate,
    request.startTime,
    request.endDate,
    request.endTime,
  )

  return (
    <div className={styles.page}>
      {/* Top navigation */}
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/requests')}
        >
          <IconArrowLeft size={16} />
          <span>Все заявки</span>
        </button>

        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Заявка #{request.id}</h1>
          <span
            className={`${styles.statusBadge} ${getStatusBadgeClass(
              request.status,
            )}`}
          >
            <span className={styles.statusDot} />
            {getStatusLabel(request.status)}
          </span>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className={styles.contentGrid}>
        {/* Left Column: Event details, Location map, Chat placeholder */}
        <div className={styles.leftColumn}>
          {/* Event Details Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Информация о мероприятии</h2>
              <span className={styles.paramLabel}>Пользовательское событие</span>
            </div>

            <h3 className={styles.eventTitle}>{request.title}</h3>
            <p className={styles.eventDescription}>{request.description}</p>

            <div className={styles.paramsGrid}>
              <div className={styles.paramItem}>
                <span className={styles.paramLabel}>Категория</span>
                <span className={styles.paramValue}>
                  {getCategoryLabel(request.category)}
                </span>
              </div>

              <div className={styles.paramItem}>
                <span className={styles.paramLabel}>Условия участия</span>
                <span className={styles.paramValue}>Бесплатно для всех</span>
              </div>

              <div className={styles.paramItem}>
                <span className={styles.paramLabel}>
                  <IconClock size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Дата и время
                </span>
                <span className={styles.paramValue}>
                  {formatDateTimeRange(
                    request.startDate,
                    request.startTime,
                    request.endDate,
                    request.endTime,
                  )}
                  {durationStr && ` (${durationStr})`}
                </span>
              </div>

              <div className={styles.paramItem}>
                <span className={styles.paramLabel}>
                  <IconUser size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Заявитель
                </span>
                <span className={styles.paramValue}>
                  {request.author.name} ({request.author.id})
                </span>
              </div>

              <div className={styles.paramItem}>
                <span className={styles.paramLabel}>Дата подачи</span>
                <span className={styles.paramValue}>
                  {formatSubmissionTime(request.submittedAt)}
                </span>
              </div>

              <div className={styles.paramItem}>
                <span className={styles.paramLabel}>Формат локации</span>
                <span className={styles.paramValue}>
                  {request.locationMode === 'point'
                    ? 'Точка на карте'
                    : `Зона проведения (${request.locationArea?.points.length || 0} точек)`}
                </span>
              </div>
            </div>
          </div>

          {/* Location & Map Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <IconMapPin size={18} />
                <span>Место проведения на карте</span>
              </h2>
            </div>

            <div className={styles.addressText}>
              <strong>Адрес / Место:</strong>
              <span>{request.address}</span>
            </div>

            <RequestLocationMap
              locationMode={request.locationMode}
              locationPoint={request.locationPoint}
              locationArea={request.locationArea}
              address={request.address}
            />
          </div>

          {/* Chat with user placeholder Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <IconMessageSquare size={18} />
                <span>Чат с пользователем</span>
              </h2>
            </div>

            <div className={styles.systemLogRow}>
              <span>Заявка подана пользователем {formatSubmissionTime(request.submittedAt)}</span>
            </div>

            <div className={styles.chatPlaceholderBox}>
              <IconMessageSquare size={24} color="var(--color-text-muted)" />
              <p className={styles.chatPlaceholderText}>
                Чат по заявке будет доступен после подключения backend-сервиса сообщений.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Moderation Workspace */}
        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Решение по заявке</h2>
            </div>

            {/* Current status explanation */}
            {request.status === 'pending' && (
              <div
                className={`${styles.currentStatusBox} ${styles.statusPendingBox}`}
              >
                <div className={styles.statusBoxHeader}>
                  <IconClock size={16} />
                  <span>Ожидает проверки</span>
                </div>
                <p className={styles.statusBoxText}>
                  Заявка ожидает рассмотрения. Ознакомьтесь с описанием и местом
                  проведения, после чего примите решение.
                </p>
              </div>
            )}

            {request.status === 'approved' && (
              <div
                className={`${styles.currentStatusBox} ${styles.statusApprovedBox}`}
              >
                <div className={styles.statusBoxHeader}>
                  <IconCheck size={16} />
                  <span>Заявка одобрена</span>
                </div>
                {request.moderatorComment && (
                  <p className={styles.statusBoxText}>
                    <strong>Комментарий:</strong> {request.moderatorComment}
                  </p>
                )}
                {request.moderatedAt && (
                  <span className={styles.statusMetaText}>
                    Модератор {request.moderatorName || 'Анна К.'} ·{' '}
                    {formatSubmissionTime(request.moderatedAt)}
                  </span>
                )}
              </div>
            )}

            {request.status === 'rejected' && (
              <div
                className={`${styles.currentStatusBox} ${styles.statusRejectedBox}`}
              >
                <div className={styles.statusBoxHeader}>
                  <IconX size={16} />
                  <span>Заявка отклонена</span>
                </div>
                {request.moderatorComment && (
                  <p className={styles.statusBoxText}>
                    <strong>Причина:</strong> {request.moderatorComment}
                  </p>
                )}
                {request.moderatedAt && (
                  <span className={styles.statusMetaText}>
                    Модератор {request.moderatorName || 'Анна К.'} ·{' '}
                    {formatSubmissionTime(request.moderatedAt)}
                  </span>
                )}
              </div>
            )}

            {request.status === 'needs_changes' && (
              <div
                className={`${styles.currentStatusBox} ${styles.statusNeedsChangesBox}`}
              >
                <div className={styles.statusBoxHeader}>
                  <IconAlertCircle size={16} />
                  <span>Запрошены уточнения</span>
                </div>
                {request.moderatorComment && (
                  <p className={styles.statusBoxText}>
                    <strong>Замечания:</strong> {request.moderatorComment}
                  </p>
                )}
                {request.moderatedAt && (
                  <span className={styles.statusMetaText}>
                    Модератор {request.moderatorName || 'Анна К.'} ·{' '}
                    {formatSubmissionTime(request.moderatedAt)}
                  </span>
                )}
              </div>
            )}

            {/* Comment input field */}
            <div className={styles.moderationCommentArea}>
              <label
                className={styles.moderationLabel}
                htmlFor="moderation-comment"
              >
                Комментарий модератора
              </label>
              <textarea
                id="moderation-comment"
                className={styles.commentInput}
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="Напишите комментарий, причину отклонения или перечень замечаний для заявителя..."
                rows={3}
              />
            </div>

            {/* Action buttons */}
            <div className={styles.actionButtonsGroup}>
              <button
                type="button"
                className={styles.btnApprove}
                onClick={() => setConfirmModalStatus('approved')}
              >
                <IconCheck size={18} />
                <span>Одобрить</span>
              </button>

              <button
                type="button"
                className={styles.btnNeedsChanges}
                onClick={() => setConfirmModalStatus('needs_changes')}
              >
                <IconAlertCircle size={16} />
                <span>Запросить уточнение</span>
              </button>

              <button
                type="button"
                className={styles.btnReject}
                onClick={() => setConfirmModalStatus('rejected')}
              >
                <IconX size={16} />
                <span>Отклонить</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalStatus && (
        <ModerationConfirmModal
          targetStatus={confirmModalStatus}
          initialComment={commentDraft}
          isOpen={Boolean(confirmModalStatus)}
          onClose={() => setConfirmModalStatus(null)}
          onConfirm={handleModalConfirm}
        />
      )}
    </div>
  )
}
