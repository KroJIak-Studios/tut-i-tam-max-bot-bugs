import React, { useCallback, useEffect, useState } from 'react'
import {
  Heart,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react'
import type { InterestItem, Locale } from './types'
import { interestsApi } from './api/interestsApi'
import { getFallbackLocaleCode } from './utils/localeUtils'
import { InterestsList } from './components/InterestsList'
import { InterestModal } from './components/InterestModal'
import styles from './InterestsView.module.css'

export const InterestsView: React.FC = () => {
  const [locales, setLocales] = useState<Locale[]>([])
  const [interests, setInterests] = useState<InterestItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [editingInterest, setEditingInterest] = useState<InterestItem | null>(null)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  const fallbackLocaleCode = getFallbackLocaleCode(locales)

  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    setErrorMessage(null)
    try {
      const [fetchedLocales, fetchedInterests] = await Promise.all([
        interestsApi.getLocales(),
        interestsApi.getInterests(),
      ])
      setLocales(fetchedLocales)
      setInterests(fetchedInterests)
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Не удалось обновить данные интересов'
      setErrorMessage(msg)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    Promise.all([interestsApi.getLocales(), interestsApi.getInterests()])
      .then(([fetchedLocales, fetchedInterests]) => {
        if (!isMounted) return
        setLocales(fetchedLocales)
        setInterests(fetchedInterests)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        if (!isMounted) return
        const msg =
          err instanceof Error
            ? err.message
            : 'Не удалось загрузить данные интересов'
        setErrorMessage(msg)
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!successToast) return
    const timer = setTimeout(() => {
      setSuccessToast(null)
    }, 4000)
    return () => clearTimeout(timer)
  }, [successToast])

  const handleOpenCreate = () => {
    setEditingInterest(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (item: InterestItem) => {
    setEditingInterest(item)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingInterest(null)
  }

  const handleRetry = () => {
    setIsLoading(true)
    setErrorMessage(null)
    Promise.all([interestsApi.getLocales(), interestsApi.getInterests()])
      .then(([fetchedLocales, fetchedInterests]) => {
        setLocales(fetchedLocales)
        setInterests(fetchedInterests)
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error
            ? err.message
            : 'Не удалось загрузить данные интересов'
        setErrorMessage(msg)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleSaveSuccess = (saved: InterestItem) => {
    const isEdit = Boolean(editingInterest)
    setSuccessToast(
      isEdit
        ? `Интерес #${saved.id} успешно обновлён`
        : `Интерес #${saved.id} успешно создан`,
    )
    refreshData()
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>
            <Heart size={26} className={styles.titleIcon} />
            <span>Интересы</span>
          </h1>
          <p className={styles.pageDescription}>
            Справочник категорий интересов пользователей с мультиязычными
            названиями
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={refreshData}
            disabled={isLoading || isRefreshing}
            title="Обновить список"
            aria-label="Обновить список интересов"
          >
            <RefreshCw
              size={17}
              className={isRefreshing ? styles.rotating : undefined}
            />
          </button>

          <button
            type="button"
            className={styles.createBtn}
            onClick={handleOpenCreate}
            disabled={isLoading}
          >
            <Plus size={16} />
            <span>Добавить интерес</span>
          </button>
        </div>
      </header>

      {successToast && (
        <div className={styles.toastSuccess} role="status">
          <div className={styles.toastLeft}>
            <CheckCircle2 size={18} />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            className={styles.toastCloseBtn}
            onClick={() => setSuccessToast(null)}
            aria-label="Закрыть уведомление"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <span>Загрузка интересов и доступных языков...</span>
        </div>
      ) : errorMessage ? (
        <div className={styles.errorState} role="alert">
          <AlertCircle size={36} color="var(--color-danger, #ef4444)" />
          <h3 className={styles.errorTitle}>Не удалось загрузить данные</h3>
          <p className={styles.errorText}>{errorMessage}</p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={handleRetry}
          >
            <RefreshCw size={15} />
            <span>Повторить попытку</span>
          </button>
        </div>
      ) : (
        <InterestsList
          interests={interests}
          locales={locales}
          fallbackLocaleCode={fallbackLocaleCode}
          onEdit={handleOpenEdit}
          onCreateClick={handleOpenCreate}
        />
      )}

      {modalOpen && (
        <InterestModal
          key={editingInterest?.id ?? 'create'}
          isOpen={modalOpen}
          interest={editingInterest}
          locales={locales}
          fallbackLocaleCode={fallbackLocaleCode}
          onClose={handleCloseModal}
          onSuccess={handleSaveSuccess}
        />
      )}
    </div>
  )
}
