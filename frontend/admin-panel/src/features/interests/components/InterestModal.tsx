import React, { useEffect, useState, useId } from 'react'
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  Globe,
} from 'lucide-react'
import type {
  InterestFormData,
  InterestItem,
  Locale,
} from '../types'
import {
  buildPayload,
  generateRowId,
  getLocaleNativeName,
  prepareInitialFormData,
  validateInterestForm,
} from '../utils/localeUtils'
import { interestsApi } from '../api/interestsApi'
import { AdminSelect } from '../../../components/AdminSelect'
import styles from './InterestModal.module.css'

interface InterestModalProps {
  isOpen: boolean
  interest: InterestItem | null
  locales: Locale[]
  fallbackLocaleCode: string
  onClose: () => void
  onSuccess: (saved: InterestItem) => void
}

export const InterestModal: React.FC<InterestModalProps> = ({
  isOpen,
  interest,
  locales,
  fallbackLocaleCode,
  onClose,
  onSuccess,
}) => {
  const isEditMode = Boolean(interest)
  const titleId = useId()

  const [formData, setFormData] = useState<InterestFormData>(() =>
    prepareInitialFormData(interest, fallbackLocaleCode),
  )
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{
    primaryName?: string
    translations?: Record<string, string>
  }>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSubmitting, onClose])



  if (!isOpen) return null

  const primaryNativeName = getLocaleNativeName(locales, formData.primaryLocaleCode)

  const usedLocales = new Set<string>([
    formData.primaryLocaleCode,
    ...formData.translations.map((t) => t.locale_code).filter(Boolean),
  ])

  const availableLocalesForNewRow = locales.filter((l) => !usedLocales.has(l.code))
  const canAddMoreTranslations = availableLocalesForNewRow.length > 0

  const handleAddTranslation = () => {
    if (!canAddMoreTranslations) return
    const nextLocale = availableLocalesForNewRow[0]
    setFormData((prev) => ({
      ...prev,
      translations: [
        ...prev.translations,
        {
          id: generateRowId(),
          locale_code: nextLocale.code,
          text: '',
        },
      ],
    }))
  }

  const handleRemoveTranslation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      translations: prev.translations.filter((t) => t.id !== id),
    }))
    setValidationErrors((prev) => {
      if (!prev.translations) return prev
      const nextTransErrors = { ...prev.translations }
      delete nextTransErrors[id]
      return { ...prev, translations: nextTransErrors }
    })
  }

  const handleTranslationLocaleChange = (id: string, newLocaleCode: string) => {
    setFormData((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.id === id ? { ...t, locale_code: newLocaleCode } : t,
      ),
    }))
    setValidationErrors((prev) => {
      if (!prev.translations) return prev
      const nextTransErrors = { ...prev.translations }
      delete nextTransErrors[id]
      return { ...prev, translations: nextTransErrors }
    })
  }

  const handleTranslationTextChange = (id: string, newText: string) => {
    setFormData((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.id === id ? { ...t, text: newText } : t,
      ),
    }))
    setValidationErrors((prev) => {
      if (!prev.translations) return prev
      const nextTransErrors = { ...prev.translations }
      delete nextTransErrors[id]
      return { ...prev, translations: nextTransErrors }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { isValid, errors } = validateInterestForm(formData)
    if (!isValid) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors({})
    setApiError(null)
    setIsSubmitting(true)

    try {
      const payload = buildPayload(formData)
      let result: InterestItem
      if (isEditMode && interest) {
        result = await interestsApi.updateInterest(interest.id, payload)
      } else {
        result = await interestsApi.createInterest(payload)
      }

      onSuccess(result)
      onClose()
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Не удалось сохранить интерес. Повторите попытку.'
      setApiError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose()
        }
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {isEditMode ? 'Редактировать интерес' : 'Новый интерес'}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Закрыть окно"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.content} noValidate>
          {apiError && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={18} className={styles.errorBannerIcon} />
              <span>{apiError}</span>
            </div>
          )}

          <div className={styles.fieldGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="primary-name-input" className={styles.label}>
                Основное название ({primaryNativeName})
              </label>
              <span className={styles.localeBadge}>
                <Globe size={11} />
                {formData.primaryLocaleCode}
              </span>
            </div>
            <input
              id="primary-name-input"
              type="text"
              className={`${styles.input} ${
                validationErrors.primaryName ? styles.inputError : ''
              }`}
              placeholder="Например: Выставки и музеи"
              value={formData.primaryName}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, primaryName: e.target.value }))
                if (validationErrors.primaryName) {
                  setValidationErrors((prev) => ({
                    ...prev,
                    primaryName: undefined,
                  }))
                }
              }}
              disabled={isSubmitting}
              autoFocus
              maxLength={255}
            />
            {validationErrors.primaryName && (
              <span className={styles.fieldError}>
                {validationErrors.primaryName}
              </span>
            )}
          </div>

          <div className={styles.translationsSection}>
            <div className={styles.translationsHeader}>
              <h3 className={styles.translationsTitle}>
                Дополнительные переводы ({formData.translations.length})
              </h3>
              <button
                type="button"
                className={styles.addTranslationBtn}
                onClick={handleAddTranslation}
                disabled={!canAddMoreTranslations || isSubmitting}
                title={
                  canAddMoreTranslations
                    ? 'Добавить перевод на другой язык'
                    : 'Все доступные языки уже добавлены'
                }
              >
                <Plus size={14} />
                <span>Добавить перевод</span>
              </button>
            </div>

            {formData.translations.length === 0 ? (
              <div className={styles.emptyTranslationsHint}>
                Дополнительные переводы не заданы. Вы можете добавить версии на
                других языках.
              </div>
            ) : (
              <div className={styles.translationRows}>
                {formData.translations.map((trans) => {
                  const allowedLocalesForRow = locales.filter(
                    (l) =>
                      l.code === trans.locale_code || !usedLocales.has(l.code),
                  )
                  const rowError = validationErrors.translations?.[trans.id]

                  return (
                    <div key={trans.id} className={styles.translationRow}>
                      <div className={styles.translationInputs}>
                        <AdminSelect
                          value={trans.locale_code}
                          disabled={isSubmitting}
                          options={allowedLocalesForRow.map((loc) => ({ value: loc.code, label: `${loc.native_name} (${loc.code})` }))}
                          onChange={(value) => handleTranslationLocaleChange(trans.id, value)}
                        />

                        <input
                          type="text"
                          className={`${styles.translationTextInput} ${
                            rowError ? styles.inputError : ''
                          }`}
                          placeholder="Текст перевода"
                          value={trans.text}
                          onChange={(e) =>
                            handleTranslationTextChange(
                              trans.id,
                              e.target.value,
                            )
                          }
                          disabled={isSubmitting}
                          maxLength={255}
                          aria-label={`Перевод для ${trans.locale_code}`}
                        />

                        <button
                          type="button"
                          className={styles.deleteTranslationBtn}
                          onClick={() => handleRemoveTranslation(trans.id)}
                          disabled={isSubmitting}
                          aria-label="Удалить перевод"
                          title="Удалить перевод"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {rowError && (
                        <span className={styles.fieldError}>{rowError}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>


        </form>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className={styles.spinner} />
                <span>Сохранение...</span>
              </>
            ) : (
              <span>{isEditMode ? 'Сохранить' : 'Создать'}</span>
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}
