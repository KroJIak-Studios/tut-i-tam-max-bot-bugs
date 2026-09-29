import { useCallback, useEffect, useMemo, useState } from 'react'
import { categoriesApi, formatCategoryApiError } from '../api/categoriesApi'
import { DEFAULT_FALLBACK_LOCALE, getConfiguredFallbackLocale } from '../constants'
import type {
  CategoryToastState,
  EventCategory,
  EventCategoryInput,
  LocaleItem,
} from '../types'

export interface UseCategoriesOptions {
  fallbackLocale?: string
}

export function useCategories(options: UseCategoriesOptions = {}) {
  const fallbackLocale = options.fallbackLocale || getConfiguredFallbackLocale() || DEFAULT_FALLBACK_LOCALE

  const [categories, setCategories] = useState<EventCategory[]>([])
  const [locales, setLocales] = useState<LocaleItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  const [activeCategory, setActiveCategory] = useState<EventCategory | null>(null)

  // Toast feedback
  const [toast, setToast] = useState<CategoryToastState | null>(null)

  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setToast({
      id: String(Date.now()),
      type,
      message,
    })
  }, [])

  const dismissToast = useCallback(() => {
    setToast(null)
  }, [])

  // Повторная/ручная загрузка данных
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [categoriesData, localesData] = await Promise.all([
        categoriesApi.getCategories(),
        categoriesApi.getLocales().catch(() => [] as LocaleItem[]),
      ])
      setCategories(categoriesData)
      setLocales(localesData)
    } catch (err) {
      const msg = formatCategoryApiError(err, 'Не удалось загрузить категории мероприятий')
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Первоначальная загрузка данных при монтировании
  useEffect(() => {
    let isMounted = true

    Promise.all([
      categoriesApi.getCategories(),
      categoriesApi.getLocales().catch(() => [] as LocaleItem[]),
    ])
      .then(([categoriesData, localesData]) => {
        if (!isMounted) return
        setCategories(categoriesData)
        setLocales(localesData)
        setIsLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        const msg = formatCategoryApiError(err, 'Не удалось загрузить категории мероприятий')
        setError(msg)
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Создание категории
  const handleCreateCategory = useCallback(
    async (payload: EventCategoryInput) => {
      try {
        const newCat = await categoriesApi.createCategory(payload)
        setCategories((prev) => [newCat, ...prev])
        showToast('success', 'Категория успешно создана')
      } catch (err) {
        const msg = formatCategoryApiError(err, 'Не удалось создать категорию')
        throw new Error(msg)
      }
    },
    [showToast],
  )

  // Редактирование категории
  const handleUpdateCategory = useCallback(
    async (payload: EventCategoryInput) => {
      if (!activeCategory) return
      try {
        const updatedCat = await categoriesApi.updateCategory(activeCategory.id, payload)
        setCategories((prev) =>
          prev.map((cat) => (cat.id === activeCategory.id ? updatedCat : cat)),
        )
        showToast('success', 'Категория успешно обновлена')
      } catch (err) {
        const msg = formatCategoryApiError(err, 'Не удалось обновить категорию')
        throw new Error(msg)
      }
    },
    [activeCategory, showToast],
  )

  // Удаление категории
  const handleDeleteCategory = useCallback(
    async (categoryId: number) => {
      try {
        await categoriesApi.deleteCategory(categoryId)
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
        showToast('success', 'Категория успешно удалена')
      } catch (err) {
        const msg = formatCategoryApiError(err, 'Не удалось удалить категорию')
        throw new Error(msg)
      }
    },
    [showToast],
  )

  // Открытие/закрытие окон
  const openCreateModal = useCallback(() => {
    setActiveCategory(null)
    setIsFormOpen(true)
  }, [])

  const openEditModal = useCallback((category: EventCategory) => {
    setActiveCategory(category)
    setIsFormOpen(true)
  }, [])

  const closeFormModal = useCallback(() => {
    setIsFormOpen(false)
    setActiveCategory(null)
  }, [])

  const openDeleteModal = useCallback((category: EventCategory) => {
    setActiveCategory(category)
    setIsDeleteOpen(true)
  }, [])

  const closeDeleteModal = useCallback(() => {
    setIsDeleteOpen(false)
    setActiveCategory(null)
  }, [])

  // Фильтрация категорий по поисковому запросу
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return categories

    return categories.filter((cat) => {
      if (String(cat.id).includes(query)) return true
      return cat.names.some(
        (n) =>
          n.text.toLowerCase().includes(query) ||
          n.locale_code.toLowerCase().includes(query),
      )
    })
  }, [categories, searchQuery])

  return {
    categories,
    filteredCategories,
    locales,
    fallbackLocale,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    loadData,
    // Modals
    isFormOpen,
    isDeleteOpen,
    activeCategory,
    openCreateModal,
    openEditModal,
    closeFormModal,
    openDeleteModal,
    closeDeleteModal,
    // Operations
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    // Feedback
    toast,
    dismissToast,
  }
}
