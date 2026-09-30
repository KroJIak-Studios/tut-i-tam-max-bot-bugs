import React, { useCallback, useEffect, useState } from 'react'
import {
  Heart,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react'
import type { InterestItem, Locale } from './types'
import { interestsApi } from './api/interestsApi'
import { getFallbackLocaleCode } from './utils/localeUtils'
import { LocalizedEntityList } from '../../components/LocalizedEntity/LocalizedEntityList'
import { InterestModal } from './components/InterestModal'
import { InterestDeleteModal } from './components/InterestDeleteModal'
import styles from './InterestsView.module.css'

export const InterestsView: React.FC = () => {
  const [locales, setLocales] = useState<Locale[]>([])
  const [interests, setInterests] = useState<InterestItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [editingInterest, setEditingInterest] = useState<InterestItem | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
  const [interestToDelete, setInterestToDelete] = useState<InterestItem | null>(null)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  const fallbackLocaleCode = getFallbackLocaleCode(locales)

  const refreshData = useCallback(async () => {
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

  const handleOpenDelete = (item: InterestItem) => {
    setInterestToDelete(item)
    setDeleteModalOpen(true)
  }

  const handleCloseDelete = () => {
    setDeleteModalOpen(false)
    setInterestToDelete(null)
  }

  const handleConfirmDelete = async (interestId: number) => {
    await interestsApi.deleteInterest(interestId)
    setInterests((prev) => prev.filter((i) => i.id !== interestId))
    setSuccessToast(`Интерес #${interestId} успешно удалён`)
    refreshData()
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
            <span>Повторить попытку</span>
          </button>
        </div>
      ) : (
        <LocalizedEntityList<InterestItem>
          items={interests}
          locales={locales}
          fallbackLocaleCode={fallbackLocaleCode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onCreateClick={handleOpenCreate}
          entityLabel="Интерес"
          countLabel="Пользователей"
          getCount={(interest) => interest.users_count}
          createButtonLabel="Добавить интерес"
          emptyTitle="Интересы не найдены"
          emptyText="В справочнике пока нет интересов. Вы можете создать первый интерес с локализацией названий."
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

      <InterestDeleteModal
        isOpen={deleteModalOpen}
        interest={interestToDelete}
        fallbackLocaleCode={fallbackLocaleCode}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
