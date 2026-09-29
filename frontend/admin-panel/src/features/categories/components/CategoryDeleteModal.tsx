import React, { useEffect, useId, useState } from 'react'
import { AlertCircle, Trash2 } from 'lucide-react'
import { splitCategoryNames } from '../constants'
import type { EventCategory } from '../types'
import styles from './CategoryDeleteModal.module.css'

export interface CategoryDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (categoryId: number) => Promise<void>
  category: EventCategory | null
  fallbackLocale: string
}

const CategoryDeleteModalContent: React.FC<{
  onClose: () => void
  onConfirm: (categoryId: number) => Promise<void>
  category: EventCategory
  fallbackLocale: string
}> = ({ onClose, onConfirm, category, fallbackLocale }) => {
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

  const { primaryName } = splitCategoryNames(category.names, fallbackLocale)
  const displayName = primaryName || `Категория #${category.id}`

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await onConfirm(category.id)
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось удалить категорию'
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
            Удалить категорию?
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
            Вы действительно хотите безвозвратно удалить категорию{' '}
            <span className={styles.categoryTarget}>«{displayName}»</span> (#{category.id})?
          </p>

          <p className={styles.warningNote}>
            Категория будет удалена из справочника. Если категория привязана к мероприятиям,
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

export const CategoryDeleteModal: React.FC<CategoryDeleteModalProps> = (props) => {
  if (!props.isOpen || !props.category) {
    return null
  }

  return (
    <CategoryDeleteModalContent
      key={`delete-modal-${props.category.id}`}
      category={props.category}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      fallbackLocale={props.fallbackLocale}
    />
  )
}
