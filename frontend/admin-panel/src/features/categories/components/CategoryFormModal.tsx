import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { AlertCircle, Globe, Plus, Trash2, X } from 'lucide-react'
import { DEFAULT_FALLBACK_LOCALE, getLocaleNativeName, splitCategoryNames } from '../constants'
import type { EventCategory, EventCategoryInput, LocaleItem, TranslationFormItem } from '../types'
import styles from './CategoryFormModal.module.css'

export interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EventCategoryInput) => Promise<void>
  category?: EventCategory | null
  locales: LocaleItem[]
  fallbackLocale?: string
}

const CategoryFormModalContent: React.FC<Omit<CategoryFormModalProps, 'isOpen'>> = ({
  onClose,
  onSubmit,
  category,
  locales,
  fallbackLocale = DEFAULT_FALLBACK_LOCALE,
}) => {
  const isEditMode = Boolean(category)
  const titleId = useId()
  const primaryInputId = useId()
  const nextIdRef = useRef(1)

  // Получаем динамическое название языка без хардкода: FALLBACK_LOCALE -> locales -> native_name
  const fallbackVisualName = getLocaleNativeName(fallbackLocale, locales)

  // Инициализация значений формы из пропсов при монтировании
  const initialData = useMemo(() => {
    if (category) {
      const { primaryName, otherTranslations } = splitCategoryNames(
        category.names,
        fallbackLocale,
      )
      return {
        primaryName,
        translations: otherTranslations.map((t, idx) => ({
          id: `trans-${idx}-${t.locale_code}`,
          locale_code: t.locale_code,
          text: t.text,
        })),
      }
    }
    return {
      primaryName: '',
      translations: [] as TranslationFormItem[],
    }
  }, [category, fallbackLocale])

  const [primaryText, setPrimaryText] = useState<string>(initialData.primaryName)
  const [translations, setTranslations] = useState<TranslationFormItem[]>(initialData.translations)
  const [primaryError, setPrimaryError] = useState<string | null>(null)
  const [translationErrors, setTranslationErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Доступные локали для дополнительных переводов (исключая основной язык)
  const availableLocalesForAdditional = locales.filter(
    (l) => l.code.toLowerCase().trim() !== fallbackLocale.toLowerCase().trim(),
  )

  // Локали, которые ещё не выбраны ни в одном дополнительном переводе
  const getUnusedLocales = (currentTranslationId?: string): LocaleItem[] => {
    const usedCodes = new Set(
      translations
        .filter((t) => t.id !== currentTranslationId)
        .map((t) => t.locale_code.toLowerCase().trim()),
    )
    return availableLocalesForAdditional.filter(
      (l) => !usedCodes.has(l.code.toLowerCase().trim()),
    )
  }

  // Закрытие по клавише Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSubmitting, onClose])

  const handleAddTranslation = () => {
    const unused = getUnusedLocales()
    if (unused.length === 0) {
      return
    }

    const firstAvailable = unused[0]
    const newId = `new-trans-${nextIdRef.current++}`
    const newItem: TranslationFormItem = {
      id: newId,
      locale_code: firstAvailable.code,
      text: '',
    }
    setTranslations((prev) => [...prev, newItem])
  }

  const handleRemoveTranslation = (id: string) => {
    setTranslations((prev) => prev.filter((t) => t.id !== id))
    setTranslationErrors((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const handleTranslationChange = (
    id: string,
    field: 'locale_code' | 'text',
    value: string,
  ) => {
    setTranslations((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    )
    if (field === 'text' && value.trim()) {
      setTranslationErrors((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let hasErrors = false
    setSubmitError(null)

    // Валидация основного названия
    if (!primaryText.trim()) {
      setPrimaryError('Основное название обязательно для заполнения')
      hasErrors = true
    } else if (primaryText.trim().length > 255) {
      setPrimaryError('Название не должно превышать 255 символов')
      hasErrors = true
    } else {
      setPrimaryError(null)
    }

    // Валидация дополнительных переводов
    const newTransErrors: Record<string, string> = {}
    for (const t of translations) {
      if (!t.text.trim()) {
        newTransErrors[t.id] = 'Введите название перевода'
        hasErrors = true
      } else if (t.text.trim().length > 255) {
        newTransErrors[t.id] = 'Название не должно превышать 255 символов'
        hasErrors = true
      }
    }
    setTranslationErrors(newTransErrors)

    if (hasErrors) {
      return
    }

    // Формирование payload
    const payload: EventCategoryInput = {
      names: [
        {
          locale_code: fallbackLocale,
          text: primaryText.trim(),
        },
        ...translations.map((t) => ({
          locale_code: t.locale_code,
          text: t.text.trim(),
        })),
      ],
    }

    setIsSubmitting(true)
    try {
      await onSubmit(payload)
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось сохранить категорию'
      setSubmitError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canAddMoreTranslations = getUnusedLocales().length > 0

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
            {isEditMode ? 'Редактировать категорию' : 'Создать категорию'}
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

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className={styles.body}>
            {submitError && (
              <div className={styles.errorBanner} role="alert">
                <AlertCircle size={18} className={styles.errorIcon} />
                <span>{submitError}</span>
              </div>
            )}

            {/* Поле основного названия */}
            <div className={styles.fieldGroup}>
              <label htmlFor={primaryInputId} className={styles.label}>
                <span>
                  Основное название ({fallbackVisualName})
                  <span className={styles.requiredMark}>*</span>
                </span>
              </label>
              <input
                id={primaryInputId}
                type="text"
                className={`${styles.input} ${primaryError ? styles.inputError : ''}`}
                value={primaryText}
                onChange={(e) => {
                  setPrimaryText(e.target.value)
                  if (primaryError && e.target.value.trim()) {
                    setPrimaryError(null)
                  }
                }}
                placeholder="Например: Выставки и искусство"
                maxLength={255}
                disabled={isSubmitting}
                autoFocus
              />
              {primaryError && <span className={styles.fieldError}>{primaryError}</span>}
            </div>

            {/* Секция дополнительных переводов */}
            <div className={styles.translationsSection}>
              <div className={styles.translationsHeader}>
                <h3 className={styles.sectionTitle}>
                  <Globe size={16} />
                  <span>Дополнительные переводы</span>
                </h3>
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={handleAddTranslation}
                  disabled={isSubmitting || !canAddMoreTranslations}
                  title={
                    !canAddMoreTranslations
                      ? 'Все доступные языки уже добавлены'
                      : 'Добавить перевод на другой язык'
                  }
                >
                  <Plus size={16} />
                  <span>Добавить язык</span>
                </button>
              </div>

              {translations.length === 0 ? (
                <div className={styles.emptyTranslationsHint}>
                  Дополнительные языки не добавлены. Категория будет отображаться на основном языке ({fallbackVisualName}).
                </div>
              ) : (
                <div className={styles.translationsList}>
                  {translations.map((trans) => {
                    const availableForThisRow = getUnusedLocales(trans.id)
                    const error = translationErrors[trans.id]

                    return (
                      <div key={trans.id} className={styles.translationRow}>
                        <select
                          className={styles.localeSelect}
                          value={trans.locale_code}
                          onChange={(e) =>
                            handleTranslationChange(trans.id, 'locale_code', e.target.value)
                          }
                          disabled={isSubmitting}
                          aria-label="Выбор языка"
                        >
                          {/* Текущая выбранная локаль */}
                          <option value={trans.locale_code}>
                            {getLocaleNativeName(trans.locale_code, locales)} ({trans.locale_code})
                          </option>
                          {/* Остальные неиспользованные локали */}
                          {availableForThisRow
                            .filter(
                              (l) =>
                                l.code.toLowerCase().trim() !==
                                trans.locale_code.toLowerCase().trim(),
                            )
                            .map((l) => (
                              <option key={l.code} value={l.code}>
                                {l.native_name} ({l.code})
                              </option>
                            ))}
                        </select>

                        <div className={styles.textInputWrap}>
                          <input
                            type="text"
                            className={`${styles.input} ${error ? styles.inputError : ''}`}
                            value={trans.text}
                            onChange={(e) =>
                              handleTranslationChange(trans.id, 'text', e.target.value)
                            }
                            placeholder="Название на выбранном языке"
                            maxLength={255}
                            disabled={isSubmitting}
                          />
                          {error && <span className={styles.fieldError}>{error}</span>}
                        </div>

                        <div className={styles.deleteRowWrap}>
                          <button
                            type="button"
                            className={styles.deleteTranslationBtn}
                            onClick={() => handleRemoveTranslation(trans.id)}
                            disabled={isSubmitting}
                            aria-label={`Удалить перевод (${trans.locale_code})`}
                            title="Удалить перевод"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

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
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.spinner} />
                  <span>Сохранение...</span>
                </>
              ) : (
                <span>{isEditMode ? 'Сохранить изменения' : 'Создать категорию'}</span>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = (props) => {
  if (!props.isOpen) {
    return null
  }

  return (
    <CategoryFormModalContent
      key={props.category ? `edit-form-${props.category.id}` : 'create-form'}
      category={props.category}
      onClose={props.onClose}
      onSubmit={props.onSubmit}
      locales={props.locales}
      fallbackLocale={props.fallbackLocale}
    />
  )
}
