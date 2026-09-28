import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { IconClose } from '../Icons'
import styles from './EditProfileModal.module.css'

interface EditProfileModalProps {
  currentName: string
  currentCity: string
  onClose: () => void
  onSave: (name: string, city: string) => void
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  currentName,
  currentCity,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation()
  const [name, setName] = useState(currentName)
  const [city, setCity] = useState(currentCity)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(name, city)
    onClose()
  }

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('profile.editProfile')}
    >
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{t('profile.editProfile')}</h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <IconClose size={18} color="currentColor" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formContent}>
            <div className={styles.fieldGroup}>
              <label htmlFor="profile-name-input" className={styles.fieldLabel}>
                {t('profile.name')}
              </label>
              <input
                id="profile-name-input"
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('profile.name')}
                required
                maxLength={40}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="profile-city-input" className={styles.fieldLabel}>
                {t('profile.city')}
              </label>
              <input
                id="profile-city-input"
                type="text"
                className={styles.input}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t('profile.city')}
                required
                maxLength={40}
              />
            </div>
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
            >
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
