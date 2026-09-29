import React, { useEffect, useRef } from 'react'
import { X, Plus, Trash2, AlertCircle, UploadCloud } from 'lucide-react'
import type { AdminEventItem } from '../types'
import styles from './EventPhotosModal.module.css'

interface EventPhotosModalProps {
  event: AdminEventItem | null
  isOpen: boolean
  isMutating: boolean
  error: string | null
  onClose: () => void
  onUpload: (eventId: number, file: File) => Promise<void>
  onDelete: (eventId: number, photoId: number) => Promise<void>
}

export const EventPhotosModal: React.FC<EventPhotosModalProps> = ({
  event,
  isOpen,
  isMutating,
  error,
  onClose,
  onUpload,
  onDelete,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isMutating) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    closeBtnRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isMutating, onClose])

  if (!isOpen || !event) return null

  const images = event.images || []
  const canUploadMore = images.length < 3

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await onUpload(event.id, file)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleOpenFileDialog = () => {
    if (isMutating || !canUploadMore) return
    fileInputRef.current?.click()
  }

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isMutating) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="photos-modal-title"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 id="photos-modal-title" className={styles.title}>
            Фотографии мероприятия
          </h2>
          <button
            type="button"
            ref={closeBtnRef}
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isMutating}
            aria-label="Закрыть окно"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.description}>
            Управление фотографиями события «{event.title}». Поддерживается до 3 изображений
            (JPG, PNG, WebP). Фотографии загружаются в защищенное хранилище через медиа-сервер.
          </p>

          {error && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {images.length > 0 ? (
            <div className={styles.photoList}>
              {images.map((img, idx) => {
                const url = typeof img === 'string' ? img : img.url
                const id = typeof img === 'string' ? idx : img.id
                const pos = typeof img === 'string' ? idx + 1 : img.position || idx + 1

                return (
                  <div key={id} className={styles.photoItem}>
                    <div className={styles.photoInfo}>
                      <img
                        src={url}
                        alt={`Фото ${idx + 1}`}
                        className={styles.previewThumb}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className={styles.photoText}>
                        <span className={styles.photoTitle}>Фото #{idx + 1}</span>
                        <span className={styles.photoMeta}>Позиция: {pos} • ID: #{id}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => onDelete(event.id, id)}
                      disabled={isMutating}
                      title="Удалить фото"
                      aria-label={`Удалить фото ${idx + 1}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={styles.emptyNotice}>
              У этого мероприятия пока нет загруженных фотографий.
            </div>
          )}

          {canUploadMore && (
            <div className={styles.uploadSection}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                disabled={isMutating}
              />
              <button
                type="button"
                className={styles.addBtn}
                onClick={handleOpenFileDialog}
                disabled={isMutating}
              >
                {isMutating ? (
                  <>
                    <UploadCloud size={16} aria-hidden="true" />
                    <span>Загрузка...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} aria-hidden="true" />
                    <span>Загрузить фото ({images.length}/3)</span>
                  </>
                )}
              </button>
              <span className={styles.uploadNotice}>
                Поддерживаются форматы JPG, PNG, WebP до 10 МБ.
              </span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onClose}
            disabled={isMutating}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
