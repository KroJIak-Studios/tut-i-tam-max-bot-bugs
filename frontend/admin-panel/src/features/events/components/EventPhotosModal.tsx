import React, { useState, useEffect, useRef } from 'react'
import { X, Plus, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react'
import type { AdminEventItem } from '../types'
import styles from './EventPhotosModal.module.css'

interface EventPhotosModalProps {
  event: AdminEventItem | null
  isOpen: boolean
  isSaving: boolean
  error: string | null
  onClose: () => void
  onSave: (eventId: number, images: string[]) => Promise<void>
}

export const EventPhotosModal: React.FC<EventPhotosModalProps> = ({
  event,
  isOpen,
  isSaving,
  error,
  onClose,
  onSave,
}) => {
  const [urls, setUrls] = useState<string[]>(() =>
    event?.images ? [...event.images] : [],
  )
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    closeBtnRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isSaving, onClose])

  if (!isOpen || !event) return null

  const handleUrlChange = (index: number, value: string) => {
    setUrls((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleAddUrl = () => {
    if (urls.length < 3) {
      setUrls((prev) => [...prev, ''])
    }
  }

  const handleRemoveUrl = (index: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Clean URLs
    const cleaned = urls.map((u) => u.trim()).filter(Boolean)
    await onSave(event.id, cleaned)
  }

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose()
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
            disabled={isSaving}
            aria-label="Закрыть окно"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className={styles.body}>
            <p className={styles.description}>
              Укажите до 3 прямых ссылок на изображения для события «{event.title}».
              Изменения сохраняются через реальный серверный метод PATCH /admin/events/{event.id}/photos.
            </p>

            {error && (
              <div className={styles.errorBanner} role="alert">
                <AlertCircle size={16} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className={styles.photoInputsList}>
              {urls.map((url, idx) => (
                <div key={idx} className={styles.photoRow}>
                  {url.trim() ? (
                    <img
                      src={url}
                      alt={`Предпросмотр ${idx + 1}`}
                      className={styles.previewThumb}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className={styles.previewPlaceholder} aria-hidden="true">
                      <ImageIcon size={20} />
                    </div>
                  )}

                  <div className={styles.inputWrapper}>
                    <label htmlFor={`photo-url-${idx}`} className={styles.inputLabel}>
                      Ссылка #{idx + 1}
                    </label>
                    <input
                      id={`photo-url-${idx}`}
                      type="url"
                      className={styles.urlInput}
                      placeholder="https://example.com/photo.jpg"
                      value={url}
                      onChange={(e) => handleUrlChange(idx, e.target.value)}
                      disabled={isSaving}
                      maxLength={2048}
                    />
                  </div>

                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => handleRemoveUrl(idx)}
                    disabled={isSaving}
                    title="Удалить ссылку"
                    aria-label={`Удалить ссылку ${idx + 1}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            {urls.length < 3 && (
              <button
                type="button"
                className={styles.addBtn}
                onClick={handleAddUrl}
                disabled={isSaving}
              >
                <Plus size={16} aria-hidden="true" />
                <span>Добавить фото ({urls.length}/3)</span>
              </button>
            )}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={onClose}
              disabled={isSaving}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={isSaving}
            >
              {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
