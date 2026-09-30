import React, { useEffect, useRef } from 'react'
import { ExternalLink, Plus, X } from 'lucide-react'
import {
  formatEventDateTime,
  formatEventPrice,
  getOriginBadge,
  getPhaseBadge,
  resolveCityName,
  resolveCategoryName,
} from '../utils/eventFormatters'
import type { City } from '../../cities/types/city'
import type { EventCategory } from '../../categories/types'
import type { AdminEventItem } from '../types'
import styles from './EventDetailModal.module.css'

interface EventDetailModalProps {
  event: AdminEventItem | null
  isOpen: boolean
  isLoading?: boolean
  cities: City[]
  categories: EventCategory[]
  onClose: () => void
  onUploadPhoto: (eventId: number, file: File) => Promise<void>
  onDeletePhoto: (eventId: number, photoId: number) => Promise<void>
  isMutatingPhoto?: boolean
  photosError?: string | null
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  isLoading,
  cities,
  categories,
  onClose,
  onUploadPhoto,
  onDeletePhoto,
  isMutatingPhoto,
  photosError,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    closeBtnRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !event) return null

  const originInfo = getOriginBadge(event.origin)
  const phaseInfo = getPhaseBadge(event.phase)
  const cityName = resolveCityName(event.city_id, cities)
  const categoryName = resolveCategoryName(event.category_id, categories)
  const priceDisplay = formatEventPrice(event)
  const hasPhotos = event.images && event.images.length > 0
  const hasArea = Boolean(event.area && event.area.length > 0)

  const handleFileChange = async (change: React.ChangeEvent<HTMLInputElement>) => {
    const file = change.target.files?.[0]
    if (!file) return
    try {
      await onUploadPhoto(event.id, file)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.badgesGroup}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background:
                    event.origin === 'official' ? '#eff6ff' : '#fffbeb',
                  color:
                    event.origin === 'official' ? '#2563eb' : '#b45309',
                  border: `1px solid ${
                    event.origin === 'official' ? '#bfdbfe' : '#fde68a'
                  }`,
                }}
              >
                {originInfo.label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: event.visible ? '#ecfdf5' : '#f1f5f9',
                  color: event.visible ? '#047857' : '#475569',
                  border: `1px solid ${event.visible ? '#a7f3d0' : '#e2e8f0'}`,
                }}
              >
                {event.visible ? 'Видно в каталоге' : 'Скрыто в каталоге'}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                }}
              >
                {phaseInfo.label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: '#f8fafc',
                  color: '#64748b',
                }}
              >
                ID: #{event.id}
              </span>
              {isLoading && (
                <span
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    fontStyle: 'italic',
                  }}
                >
                  Обновление данных...
                </span>
              )}
            </div>
            <h2 id="event-detail-title" className={styles.title}>
              {event.title}
            </h2>
          </div>

          <button
            type="button"
            ref={closeBtnRef}
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Закрыть окно"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.body}>
          {/* Photo gallery preview */}
          <section className={styles.gallerySection}>
            <h3 className={styles.sectionHeading}>
              Фотографии ({event.images?.length || 0}/3)
            </h3>
            <div className={styles.photoGrid}>
              {hasPhotos && event.images.map((img, idx) => {
                const url = typeof img === 'string' ? img : img.url
                const photoId = typeof img === 'string' ? null : img.id
                const key = photoId || idx
                return (
                  <div key={key} className={styles.photoItem}>
                    <img src={url} alt="" className={styles.photoThumb} />
                    {photoId != null && (
                      <button
                        type="button"
                        className={styles.photoDelete}
                        disabled={isMutatingPhoto}
                        aria-label="Удалить фотографию"
                        onClick={() => onDeletePhoto(event.id, photoId)}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
              {(event.images?.length || 0) < 3 && (
                <button
                  type="button"
                  className={styles.photoAdd}
                  disabled={isMutatingPhoto}
                  aria-label="Добавить фотографию"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus size={28} />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handleFileChange}
            />
            {photosError && <p className={styles.photoError}>{photosError}</p>}
          </section>

          {/* Key metadata grid */}
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <span className={styles.fieldLabel}>Город</span>
              <span className={styles.fieldValue}>{cityName}</span>
            </div>

            <div className={styles.gridItem}>
              <span className={styles.fieldLabel}>Категория</span>
              <span className={styles.fieldValue}>{categoryName}</span>
            </div>

            <div className={styles.gridItemFull}>
              <span className={styles.fieldLabel}>Дата и время</span>
              <span className={styles.fieldValue}>
                {formatEventDateTime(event.starts_at, event.ends_at)}
              </span>
            </div>

            <div className={styles.gridItemFull}>
              <span className={styles.fieldLabel}>Точный адрес</span>
              <span className={styles.fieldValue}>{event.address}</span>
            </div>

            <div className={styles.gridItem}>
              <span className={styles.fieldLabel}>Геолокация</span>
              <span className={styles.fieldValue}>
                {event.latitude.toFixed(5)}, {event.longitude.toFixed(5)}
              </span>
            </div>

            <div className={styles.gridItem}>
              <span className={styles.fieldLabel}>Зона на карте (полигон)</span>
              <span className={styles.fieldValue}>
                {hasArea
                  ? `Задана (${event.area?.length} точек)`
                  : 'Не задана'}
              </span>
            </div>

            <div className={styles.gridItem}>
              <span className={styles.fieldLabel}>Стоимость</span>
              <span className={styles.fieldValue}>{priceDisplay}</span>
            </div>

            <div className={styles.gridItem}>
              <span className={styles.fieldLabel}>Пушкинская карта</span>
              <span className={styles.fieldValue}>
                {event.pushkin_card ? 'Поддерживается' : 'Не поддерживается'}
              </span>
            </div>

            <div className={styles.gridItemFull}>
              <span className={styles.fieldLabel}>Чат MAX</span>
              <span className={styles.fieldValue}>
                {event.chat_connected ? (
                  <span style={{ color: '#10b981', fontWeight: 600 }}>
                    Подключен
                  </span>
                ) : (
                  <span style={{ color: '#64748b' }}>Не подключен</span>
                )}
                {event.chat_invite_url && (
                  <div style={{ marginTop: 4 }}>
                    <a
                      href={event.chat_invite_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.chatUrlLink}
                    >
                      <span>{event.chat_invite_url}</span>
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  </div>
                )}
              </span>
            </div>

            <div className={styles.gridItem}>
              <span className={styles.fieldLabel}>Участники</span>
              <span className={styles.fieldValue}>{event.attendees_count ?? 0}</span>
            </div>

            {event.author ? (
              <div className={styles.gridItemFull}>
                <span className={styles.fieldLabel}>Автор (пользователь)</span>
                <span className={styles.fieldValue}>
                  {event.author.first_name} {event.author.last_name || ''} (ID: #{event.author.id})
                </span>
              </div>
            ) : (
              <div className={styles.gridItemFull}>
                <span className={styles.fieldLabel}>Источник</span>
                <span className={styles.fieldValue}>Официальное мероприятие</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className={styles.descriptionBox}>
            <h3 className={styles.sectionHeading}>Описание мероприятия</h3>
            <p className={styles.descriptionText}>
              {event.description || 'Описание не заполнено.'}
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
