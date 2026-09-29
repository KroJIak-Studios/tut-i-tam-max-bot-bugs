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

  const handleCreateCity = useCallback(
    async (payload: CityCreatePayload) => {
      setIsSaving(true)
      try {
        const newCity = await citiesApi.createCity(payload)
        // Refresh full list from server or add to state
        setCities((prev) => [...prev, newCity])
        setActiveModal(null)
        // Also reload from server to stay in sync
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
    searchQuery,
    setSearchQuery,
    loadData,
    openCreateModal,
    openEditModal,
    closeModal,
    handleCreateCity,
    handleUpdateCity,
  }
}
