import { useCallback, useEffect, useMemo, useState } from 'react'
import { citiesApi } from '../api/citiesApi'
import {
  getFallbackLocale,
} from '../constants/locales'
import type { City, CityCreatePayload, Locale } from '../types/city'

export interface ActiveModalState {
  mode: 'create' | 'edit'
  city?: City
}

export function useCities() {
  const [cities, setCities] = useState<City[]>([])
  const [locales, setLocales] = useState<Locale[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [activeModal, setActiveModal] = useState<ActiveModalState | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const fallbackLocale = useMemo(
    () => getFallbackLocale(locales),
    [locales],
  )

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [fetchedCities, fetchedLocales] = await Promise.all([
        citiesApi.listCities(),
        citiesApi.listLocales(),
      ])
      setCities(fetchedCities)
      setLocales(fetchedLocales)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Не удалось загрузить данные городов'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    Promise.all([citiesApi.listCities(), citiesApi.listLocales()])
      .then(([fetchedCities, fetchedLocales]) => {
        if (!ignore) {
          setCities(fetchedCities)
          setLocales(fetchedLocales)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          const message =
            err instanceof Error ? err.message : 'Не удалось загрузить данные городов'
          setError(message)
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  const [cityToDelete, setCityToDelete] = useState<City | null>(null)

  const openCreateModal = useCallback(() => {
    setActiveModal({ mode: 'create' })
  }, [])

  const openEditModal = useCallback((city: City) => {
    setActiveModal({ mode: 'edit', city })
  }, [])

  const closeModal = useCallback(() => {
    if (!isSaving) {
      setActiveModal(null)
    }
  }, [isSaving])

  const openDeleteModal = useCallback((city: City) => {
    setCityToDelete(city)
    setIsDeleteOpen(true)
  }, [])

  const closeDeleteModal = useCallback(() => {
    setCityToDelete(null)
    setIsDeleteOpen(false)
  }, [])

  const handleDeleteCity = useCallback(
    async (cityId: number) => {
      try {
        await citiesApi.deleteCity(cityId)
        setCities((prev) => prev.filter((c) => c.id !== cityId))
        setCityToDelete(null)
        setIsDeleteOpen(false)
        loadData()
      } catch (err: unknown) {
        if (
          err &&
          typeof err === 'object' &&
          'message' in err &&
          (err as { message: string }).message === 'city_in_use'
        ) {
          throw new Error(
            'Невозможно удалить город: к нему привязаны мероприятия, пользователи или зоны карты.',
          )
        }
        if (
          err &&
          typeof err === 'object' &&
          'status' in err &&
          (err as { status: number }).status === 409
        ) {
          throw new Error(
            'Невозможно удалить город: к нему привязаны мероприятия, пользователи или зоны карты.',
          )
        }
        throw err
      }
    },
    [loadData],
  )

  const handleCreateCity = useCallback(
    async (payload: CityCreatePayload) => {
      setIsSaving(true)
      try {
        const newCity = await citiesApi.createCity(payload)
        setCities((prev) => [...prev, newCity])
        setActiveModal(null)
        loadData()
      } finally {
        setIsSaving(false)
      }
    },
    [loadData],
  )

  const handleUpdateCity = useCallback(
    async (cityId: number, payload: CityCreatePayload) => {
      setIsSaving(true)
      try {
        const updated = await citiesApi.updateCity(cityId, payload)
        setCities((prev) =>
          prev.map((c) => (c.id === cityId ? { ...c, ...updated } : c)),
        )
        setActiveModal(null)
        loadData()
      } finally {
        setIsSaving(false)
      }
    },
    [loadData],
  )

  const filteredCities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return cities

    return cities.filter((city) => {
      if (city.id.toString() === q) return true
      return city.names.some((n) => n.text.toLowerCase().includes(q))
    })
  }, [cities, searchQuery])

  return {
    cities: filteredCities,
    rawCitiesCount: cities.length,
    locales,
    fallbackLocale,
    isLoading,
    error,
    isSaving,
    activeModal,
    isDeleteOpen,
    cityToDelete,
    searchQuery,
    setSearchQuery,
    loadData,
    openCreateModal,
    openEditModal,
    closeModal,
    openDeleteModal,
    closeDeleteModal,
    handleCreateCity,
    handleUpdateCity,
    handleDeleteCity,
  }
}
