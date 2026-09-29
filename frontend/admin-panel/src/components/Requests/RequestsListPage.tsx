import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ChevronRight, AlertCircle } from 'lucide-react'
import { moderationApi } from '../../features/moderation/api/moderationApi'
import type {
  ModerationStatus,
  ModerationQueueResponse,
  ModerationCounts,
  ModerationEventCard,
} from '../../features/moderation/types'
import {
  getModerationStatusLabel,
  formatTimeAgo,
  formatDateRange,
} from '../../utils/moderationFormatters'
import { categoriesApi } from '../../features/categories/api/categoriesApi'
import { citiesApi } from '../../features/cities/api/citiesApi'
import type { EventCategory } from '../../features/categories/types'
import type { City } from '../../features/cities/types/city'
import styles from './RequestsListPage.module.css'

const PAGE_SIZE = 20

const STATUS_TABS: Array<{ value: ModerationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'pending', label: 'На проверке' },
  { value: 'changes_requested', label: 'На доработку' },
  { value: 'approved', label: 'Одобрено' },
  { value: 'rejected', label: 'Отклонено' },
]

function getStatusBadgeClass(status: ModerationStatus): string {
  switch (status) {
    case 'pending':
      return styles.statusPending
    case 'approved':
      return styles.statusApproved
    case 'rejected':
      return styles.statusRejected
    case 'changes_requested':
      return styles.statusChanges
    default:
      return ''
  }
}

function getCategoryName(
  categoryId: number | null,
  categories: EventCategory[],
): string {
  if (categoryId === null) return '—'
  const found = categories.find((c) => c.id === categoryId)
  if (!found) return `#${categoryId}`
  const ruName = found.names.find((n) => n.locale_code === 'ru')
  if (ruName) return ruName.text
  return found.names[0]?.text || `#${categoryId}`
}

function getCityName(cityId: number, cities: City[]): string {
  const found = cities.find((c) => c.id === cityId)
  if (!found) return `#${cityId}`
  const ruName = found.names.find((n) => n.locale_code === 'ru')
  if (ruName) return ruName.text
  return found.names[0]?.text || `#${cityId}`
}

export const RequestsListPage: React.FC = () => {
  const navigate = useNavigate()

  const [data, setData] = useState<ModerationQueueResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedStatus, setSelectedStatus] = useState<ModerationStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedCityId, setSelectedCityId] = useState<number | 'all'>('all')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all')
  const [offset, setOffset] = useState(0)

  const [categories, setCategories] = useState<EventCategory[]>([])
  const [cities, setCities] = useState<City[]>([])

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Load reference data once
  useEffect(() => {
    Promise.allSettled([categoriesApi.getCategories(), citiesApi.listCities()]).then(
      ([catResult, cityResult]) => {
        if (catResult.status === 'fulfilled') setCategories(catResult.value)
        if (cityResult.status === 'fulfilled') setCities(cityResult.value)
      },
    )
  }, [])

  const load = useCallback(() => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setIsLoading(true)
    setError(null)

    moderationApi
      .getQueue({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        city_id: selectedCityId === 'all' ? undefined : selectedCityId,
        category_id: selectedCategoryId === 'all' ? undefined : selectedCategoryId,
        q: search || undefined,
        limit: PAGE_SIZE,
        offset,
      })
      .then((res) => {
        if (!ctrl.signal.aborted) {
          setData(res)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!ctrl.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Не удалось загрузить заявки')
          setIsLoading(false)
        }
      })
  }, [selectedStatus, selectedCityId, selectedCategoryId, search, offset])

  useEffect(() => {
    setOffset(0)
  }, [selectedStatus, selectedCityId, selectedCategoryId, search])

  useEffect(() => {
    load()
    return () => abortRef.current?.abort()
  }, [load])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setSearch(value)
    }, 350)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearch('')
  }

  const counts: ModerationCounts = data?.counts ?? {
    pending: 0,
    approved: 0,
    rejected: 0,
    changes_requested: 0,
  }

  const total = data?.total ?? 0
  const items: ModerationEventCard[] = data?.items ?? []
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  const tabCount = (tab: ModerationStatus | 'all'): number | null => {
    if (tab === 'all') return total
    if (tab === 'pending') return counts.pending
    if (tab === 'approved') return counts.approved
    if (tab === 'rejected') return counts.rejected
    if (tab === 'changes_requested') return counts.changes_requested
    return null
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Заявки на мероприятия</h1>
          <p className={styles.pageSubtitle}>
            Модерация пользовательских мероприятий
          </p>
        </div>
      </header>

      {/* Status tabs */}
      <div className={styles.statsBar} role="tablist" aria-label="Фильтр по статусу">
        {STATUS_TABS.map((tab) => {
          const count = tabCount(tab.value)
          const isActive = selectedStatus === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.statTab} ${isActive ? styles.active : ''}`}
              onClick={() => setSelectedStatus(tab.value)}
            >
              <span>{tab.label}</span>
              {count !== null && count >= 0 && (
                <span
                  className={`${styles.statCount} ${tab.value === 'pending' && count > 0 ? styles.statCountPending : ''}`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className={styles.filtersRow}>
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Поиск по названию, описанию, адресу..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Поиск заявок"
          />
          {searchInput && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={handleClearSearch}
              aria-label="Очистить поиск"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {cities.length > 0 && (
          <select
            className={styles.filterSelect}
            value={selectedCityId}
            onChange={(e) =>
              setSelectedCityId(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            aria-label="Фильтр по городу"
          >
            <option value="all">Все города</option>
            {cities.map((city) => {
              const name = city.names.find((n) => n.locale_code === 'ru')?.text ?? city.names[0]?.text ?? `#${city.id}`
              return (
                <option key={city.id} value={city.id}>
                  {name}
                </option>
              )
            })}
          </select>
        )}

        {categories.length > 0 && (
          <select
            className={styles.filterSelect}
            value={selectedCategoryId}
            onChange={(e) =>
              setSelectedCategoryId(
                e.target.value === 'all' ? 'all' : Number(e.target.value),
              )
            }
            aria-label="Фильтр по категории"
          >
            <option value="all">Все категории</option>
            {categories.map((cat) => {
              const name =
                cat.names.find((n) => n.locale_code === 'ru')?.text ??
                cat.names[0]?.text ??
                `#${cat.id}`
              return (
                <option key={cat.id} value={cat.id}>
                  {name}
                </option>
              )
            })}
          </select>
        )}

        {(selectedCityId !== 'all' || selectedCategoryId !== 'all' || search) && (
          <button
            type="button"
            className={styles.resetFiltersBtn}
            onClick={() => {
              setSelectedCityId('all')
              setSelectedCategoryId('all')
              handleClearSearch()
            }}
          >
            Сбросить фильтры
          </button>
        )}
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <div className={styles.errorState} role="alert">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button type="button" className={styles.retryBtn} onClick={load}>
            Повторить
          </button>
        </div>
      )}

      {/* Table card */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.emptyState}>
            <div className={styles.spinner} />
            <div className={styles.emptyTitle}>Загрузка заявок...</div>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>Заявок не найдено</div>
            <p className={styles.emptyText}>
              По заданным критериям фильтрации нет ни одной заявки.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead className={styles.thead}>
                  <tr>
                    <th className={styles.th}>ID</th>
                    <th className={styles.th}>Название</th>
                    <th className={styles.th}>Автор</th>
                    <th className={styles.th}>Город</th>
                    <th className={styles.th}>Категория</th>
                    <th className={styles.th}>Дата</th>
                    <th className={styles.th}>Подано</th>
                    <th className={styles.th}>Статус</th>
                    <th className={styles.th} />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className={styles.tr}
                      onClick={() => navigate(`/requests/${item.id}`)}
                    >
                      <td className={`${styles.td} ${styles.idCell}`}>#{item.id}</td>
                      <td className={`${styles.td} ${styles.titleCell}`}>
                        {item.title}
                      </td>
                      <td className={styles.td}>
                        {item.author ? (
                          <div className={styles.authorCell}>
                            <span className={styles.authorName}>
                              {item.author.first_name}
                              {item.author.last_name ? ` ${item.author.last_name}` : ''}
                            </span>
                            <span className={styles.authorId}>#{item.author.id}</span>
                          </div>
                        ) : (
                          <span className={styles.noValue}>—</span>
                        )}
                      </td>
                      <td className={styles.td}>
                        <span className={styles.cityBadge}>
                          {getCityName(item.city_id, cities)}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.categoryBadge}>
                          {getCategoryName(item.category_id, categories)}
                        </span>
                      </td>
                      <td className={`${styles.td} ${styles.dateCell}`}>
                        {formatDateRange(item.starts_at, item.ends_at)}
                      </td>
                      <td className={`${styles.td} ${styles.timeAgo}`}>
                        {formatTimeAgo(item.moderation?.submitted_at)}
                      </td>
                      <td className={styles.td}>
                        {item.moderation && (
                          <span
                            className={`${styles.statusBadge} ${getStatusBadgeClass(item.moderation.status)}`}
                          >
                            <span className={styles.statusDot} />
                            {getModerationStatusLabel(item.moderation.status)}
                          </span>
                        )}
                      </td>
                      <td className={styles.td}>
                        <button
                          type="button"
                          className={styles.openLink}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/requests/${item.id}`)
                          }}
                          aria-label={`Открыть заявку ${item.title}`}
                        >
                          <span>Открыть</span>
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className={styles.mobileCardList}>
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.mobileCard}
                  onClick={() => navigate(`/requests/${item.id}`)}
                >
                  <div className={styles.mobileCardTop}>
                    <span className={styles.mobileCardTitle}>{item.title}</span>
                    {item.moderation && (
                      <span
                        className={`${styles.statusBadge} ${getStatusBadgeClass(item.moderation.status)}`}
                      >
                        <span className={styles.statusDot} />
                        {getModerationStatusLabel(item.moderation.status)}
                      </span>
                    )}
                  </div>
                  <div className={styles.mobileCardMeta}>
                    {item.author && (
                      <span>
                        {item.author.first_name}
                        {item.author.last_name ? ` ${item.author.last_name}` : ''} · #{item.author.id}
                      </span>
                    )}
                    <span>{getCityName(item.city_id, cities)}</span>
                    <span>{formatTimeAgo(item.moderation?.submitted_at)}</span>
                  </div>
                  <ChevronRight size={16} className={styles.mobileCardChevron} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={currentPage <= 1}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            ← Назад
          </button>
          <span className={styles.pageInfo}>
            Страница {currentPage} из {totalPages} · {total} заявок
          </span>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={currentPage >= totalPages}
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            Далее →
          </button>
        </div>
      )}

      {!isLoading && total > 0 && totalPages <= 1 && (
        <div className={styles.totalInfo}>
          Показано {items.length} из {total} заявок
        </div>
      )}
    </div>
  )
}
