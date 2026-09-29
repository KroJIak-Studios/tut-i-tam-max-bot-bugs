import React, { useEffect, useState } from 'react'
import {
  X,
  Plus,
  Trash2,
  Building2,
  AlertCircle,
  Languages,
} from 'lucide-react'
import type {
  City,
  CityCreatePayload,
  CityFormErrors,
  Locale,
  TranslationFormItem,
} from '../types/city'
import { CityMapPicker } from './CityMapPicker'
import styles from './CityFormModal.module.css'

interface CityFormModalProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  initialCity?: City | null
  locales: Locale[]
  fallbackLocale: Locale
  onClose: () => void
  onSubmit: (payload: CityCreatePayload) => Promise<void>
  isSubmitting: boolean
}

export const CityFormModal: React.FC<CityFormModalProps> = ({
  isOpen,
  mode,
  initialCity,
  locales,
  fallbackLocale,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [mainText, setMainText] = useState<string>(() => {
    if (mode === 'edit' && initialCity) {
      const fallbackName = initialCity.names.find(
        (n) => n.locale_code.toLowerCase() === fallbackLocale.code.toLowerCase(),
      )
      return fallbackName?.text || initialCity.names[0]?.text || ''
    }
    return ''
  })

  const [translations, setTranslations] = useState<TranslationFormItem[]>(() => {
    if (mode === 'edit' && initialCity) {
      return initialCity.names
        .filter(
          (n) => n.locale_code.toLowerCase() !== fallbackLocale.code.toLowerCase(),
        )
        .map((n, idx) => ({
          id: `item_${idx}_${n.locale_code}`,
          locale_code: n.locale_code,
          text: n.text,
        }))
    }
    return []
  })

  const [latitude, setLatitude] = useState<number | null>(() =>
    mode === 'edit' && initialCity ? initialCity.latitude ?? null : null,
  )
  const [longitude, setLongitude] = useState<number | null>(() =>
    mode === 'edit' && initialCity ? initialCity.longitude ?? null : null,
  )
  const [errors, setErrors] = useState<CityFormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  // Compute which locales are already used
  const usedLocaleCodes = new Set<string>([
    fallbackLocale.code.toLowerCase(),
    ...translations.map((t) => t.locale_code.toLowerCase()),
  ])

  // Available locales that can be added
  const remainingLocales = locales.filter(
    (l) => !usedLocaleCodes.has(l.code.toLowerCase()),
  )

  const handleAddTranslation = () => {
    if (remainingLocales.length === 0) return
    const nextLocale = remainingLocales[0]
    setTranslations((prev) => [
      ...prev,
      {
        id: `trans_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        locale_code: nextLocale.code,
        text: '',
      },
    ])
  }

  const handleRemoveTranslation = (id: string) => {
    setTranslations((prev) => prev.filter((t) => t.id !== id))
    setErrors((prev) => {
      if (!prev.translations) return prev
      const nextTransErrors = { ...prev.translations }
      delete nextTransErrors[id]
      return { ...prev, translations: nextTransErrors }
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
    if (field === 'text' && errors.translations?.[id]) {
      setErrors((prev) => {
        const nextTrans = { ...prev.translations }
        delete nextTrans[id]
        return { ...prev, translations: nextTrans }
      })
    }
  }

  const handleMainTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMainText(e.target.value)
    if (errors.mainText) {
      setErrors((prev) => ({ ...prev, mainText: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const nextErrors: CityFormErrors = {}

    if (!mainText.trim()) {
      nextErrors.mainText = `Укажите название города (${fallbackLocale.native_name})`
    }

    const transErrors: Record<string, string> = {}
    translations.forEach((t) => {
      if (!t.text.trim()) {
        const loc = locales.find((l) => l.code === t.locale_code)
        transErrors[t.id] = `Заполните перевод (${loc?.native_name || t.locale_code})`
      }
    })

    if (Object.keys(transErrors).length > 0) {
      nextErrors.translations = transErrors
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    // Assemble payload
    const names = [
      { locale_code: fallbackLocale.code, text: mainText.trim() },
      ...translations.map((t) => ({
        locale_code: t.locale_code,
        text: t.text.trim(),
      })),
    ]

    const payload: CityCreatePayload = {
      names,
      latitude: latitude != null ? latitude : null,
      longitude: longitude != null ? longitude : null,
    }

    try {
      await onSubmit(payload)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось сохранить город'
      setServerError(msg)
    }
  }

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-form-title"
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIcon}>
              <Building2 size={20} />
            </div>
            <h2 id="city-form-title" className={styles.title}>
              {mode === 'create'
                ? 'Новый город'
                : `Редактирование: ${initialCity?.names[0]?.text || `Город #${initialCity?.id}`}`}
            </h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Закрыть окно"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="city-form" onSubmit={handleSubmit} className={styles.body} noValidate>
          {serverError && (
            <div className={`${styles.alertBox} ${styles.alertError}`} role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong>Ошибка сохранения:</strong>
                <div>{serverError}</div>
              </div>
            </div>
          )}

          {/* Primary Name Section */}
          <div className={styles.section}>
            <div className={styles.field}>
              <label htmlFor="city-main-name" className={styles.label}>
                <span className={styles.labelFallback}>
                  Основное название
                  <span className={styles.localePill}>
                    {fallbackLocale.native_name} ({fallbackLocale.code})
                  </span>
                </span>
              </label>
              <input
                id="city-main-name"
                type="text"
                className={`${styles.input} ${errors.mainText ? styles.inputError : ''}`}
                placeholder={`Например: Казань`}
                value={mainText}
                onChange={handleMainTextChange}
                disabled={isSubmitting}
                autoFocus
              />
              {errors.mainText && (
                <p className={styles.fieldError} role="alert">
                  {errors.mainText}
                </p>
              )}
            </div>
          </div>

          {/* Additional Translations Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <Languages size={16} />
                <span>Дополнительные переводы ({translations.length})</span>
              </h3>
              <button
                type="button"
                className={styles.addTranslationBtn}
                onClick={handleAddTranslation}
                disabled={isSubmitting || remainingLocales.length === 0}
              >
                <Plus size={15} />
                <span>Добавить язык</span>
              </button>
            </div>
            <p className={styles.sectionSubtitle}>
              Добавьте переводы названия для пользователей с другими локалями.
            </p>

            {translations.length > 0 && (
              <div className={styles.translationsList}>
                {translations.map((item) => {
                  // Available options for this specific row:
                  // All unused locales + the locale currently selected for this row
                  const rowAvailableLocales = locales.filter(
                    (l) =>
                      l.code.toLowerCase() === item.locale_code.toLowerCase() ||
                      !usedLocaleCodes.has(l.code.toLowerCase()),
                  )

                  const itemError = errors.translations?.[item.id]

                  return (
                    <div key={item.id} className={styles.translationRow}>
                      <div className={styles.translationFields}>
                        <select
                          className={styles.select}
                          value={item.locale_code}
                          onChange={(e) =>
                            handleTranslationChange(item.id, 'locale_code', e.target.value)
                          }
                          disabled={isSubmitting}
                          aria-label="Выбор языка"
                        >
                          {rowAvailableLocales.map((loc) => (
                            <option key={loc.code} value={loc.code}>
                              {loc.native_name} ({loc.code})
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          className={`${styles.input} ${itemError ? styles.inputError : ''}`}
                          placeholder="Название на выбранном языке"
                          value={item.text}
                          onChange={(e) =>
                            handleTranslationChange(item.id, 'text', e.target.value)
                          }
                          disabled={isSubmitting}
                          aria-label="Перевод названия"
                        />
                      </div>

                      <button
                        type="button"
                        className={styles.removeTranslationBtn}
                        onClick={() => handleRemoveTranslation(item.id)}
                        disabled={isSubmitting}
                        title="Удалить перевод"
                        aria-label="Удалить перевод"
                      >
                        <Trash2 size={16} />
                        <span>Удалить</span>
                      </button>

                      {itemError && (
                        <p className={styles.fieldError} role="alert">
                          {itemError}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Map Coordinates Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Географические координаты центра</h3>
            </div>
            <p className={styles.sectionSubtitle}>
              Координаты используются как дефолтная точка карты при фильтрации событий
              города.
            </p>

            <CityMapPicker
              latitude={latitude}
              longitude={longitude}
              onChange={(lat, lng) => {
                setLatitude(lat)
                setLongitude(lng)
              }}
              readOnly={isSubmitting}
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className={styles.footer}>
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
            form="city-form"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className={styles.spinner} />
                <span>Сохранение...</span>
              </>
            ) : (
              <span>{mode === 'create' ? 'Создать город' : 'Сохранить изменения'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
