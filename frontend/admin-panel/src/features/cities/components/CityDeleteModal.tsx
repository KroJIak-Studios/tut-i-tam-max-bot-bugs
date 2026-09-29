import React, { useEffect, useId, useState } from 'react'
import { AlertCircle, Trash2 } from 'lucide-react'
import { getCityMainName } from '../constants/locales'
import type { City, Locale } from '../types/city'
import styles from './CityDeleteModal.module.css'

export interface CityDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (cityId: number) => Promise<void>
  city: City | null
  fallbackLocale: Locale
}

const CityDeleteModalContent: React.FC<{
  onClose: () => void
  onConfirm: (cityId: number) => Promise<void>
  city: City
  fallbackLocale: Locale
}> = ({ onClose, onConfirm, city, fallbackLocale }) => {
  const titleId = useId()
  const descId = useId()
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDeleting, onClose])

  const displayName = getCityMainName(city, fallbackLocale.code)

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await onConfirm(city.id)
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось удалить город'
      setDeleteError(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose()
        }
      }}
    >
      <div
        className={styles.modal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Trash2 size={20} />
          </div>
          <h2 id={titleId} className={styles.title}>
            Удалить город?
          </h2>
        </div>

        <div className={styles.body}>
          {deleteError && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={16} />
              <span>{deleteError}</span>
            </div>
          )}

          <p id={descId} className={styles.description}>
            Вы действительно хотите безвозвратно удалить город{' '}
            <span className={styles.cityTarget}>«{displayName}»</span> (#{city.id})?
          </p>

          <p className={styles.warningNote}>
            Город будет удалён из справочника. Если к городу привязаны мероприятия, пользователи или зоны карты,
            сервер отклонит удаление.
          </p>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isDeleting}
          >
            Отмена
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={isDeleting}
            autoFocus
          >
            {isDeleting ? (
              <>
                <div className={styles.spinner} />
                <span>Удаление...</span>
              </>
            ) : (
              <span>Удалить</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export const CityDeleteModal: React.FC<CityDeleteModalProps> = (props) => {
  if (!props.isOpen || !props.city) {
    return null
  }

  return (
    <CityDeleteModalContent
      key={`delete-city-${props.city.id}`}
      city={props.city}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      fallbackLocale={props.fallbackLocale}
    />
  )
}
