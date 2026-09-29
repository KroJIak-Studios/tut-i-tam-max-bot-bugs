import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { IconTrash } from '../Icons'
import styles from './DeleteDataModal.module.css'

interface Props {
  isDeleting: boolean
  error: boolean
  onClose: () => void
  onConfirm: () => void
}

export const DeleteDataModal: React.FC<Props> = ({ isDeleting, error, onClose, onConfirm }) => {
  const { t } = useTranslation()
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDeleting, onClose])

  return <div className={styles.backdrop} onClick={() => !isDeleting && onClose()} role="dialog" aria-modal="true" aria-labelledby="delete-data-title">
    <div className={styles.sheet} onClick={(event) => event.stopPropagation()}>
      <div className={styles.icon}><IconTrash size={24} color="#DC2626" /></div>
      <h3 id="delete-data-title" className={styles.title}>{t('profile.deleteDataTitle')}</h3>
      <p className={styles.description}>{t('profile.deleteDataDescription')}</p>
      {error && <p className={styles.error} role="alert">{t('profile.deleteDataError')}</p>}
      <div className={styles.actions}><button type="button" className={styles.cancel} onClick={onClose} disabled={isDeleting}>{t('common.cancel')}</button><button type="button" className={styles.confirm} onClick={onConfirm} disabled={isDeleting}>{t('profile.deleteDataConfirm')}</button></div>
    </div>
  </div>
}
