import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type {
  AdminEventRequest,
  AdminRequestStatus,
  EventCategory,
  LocationMode,
} from '../../types/request'
import {
  getRequests,
  getRequestsStats,
  ADMIN_REQUESTS_CHANGED_EVENT,
} from '../../services/adminRequestsRepository'
import {
  getStatusLabel,
  getCategoryLabel,
  formatDateTimeRange,
  formatSubmissionTime,
} from '../../utils/formatters'
import {
  IconSearch,
  IconX,
  IconArrowRight,
  IconMapPin,
  IconPolygon,
} from '../Icons'
import styles from './RequestsListPage.module.css'

export const RequestsListPage: React.FC = () => {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<AdminEventRequest[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    needsChanges: 0,
    approved: 0,
    rejected: 0,
  })

  // Filters
  const [search, setSearch] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<AdminRequestStatus | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all')
  const [selectedLocationMode, setSelectedLocationMode] = useState<LocationMode | 'all'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  const loadData = useCallback(() => {
    let isCurrent = true
    Promise.all([
      getRequests({
        search,
        status: selectedStatus,
        category: selectedCategory,
        locationMode: selectedLocationMode,
        sort: sortOrder,
      }),
      getRequestsStats(),
    ]).then(([list, st]) => {
      if (isCurrent) {
        setRequests(list)
        setStats(st)
        setLoading(false)
      }
    })
    return () => {
      isCurrent = false
    }
  }, [search, selectedStatus, selectedCategory, selectedLocationMode, sortOrder])

  useEffect(() => {
    const cleanup = loadData()
    return cleanup
  }, [loadData])

  useEffect(() => {
    const handleChanged = () => {
      loadData()
    }
    window.addEventListener(ADMIN_REQUESTS_CHANGED_EVENT, handleChanged)
    return () => {
      window.removeEventListener(ADMIN_REQUESTS_CHANGED_EVENT, handleChanged)
    }
  }, [loadData])

  const hasActiveFilters = useMemo(() => {
    return (
      search.trim().length > 0 ||
      selectedStatus !== 'all' ||
      selectedCategory !== 'all' ||
      selectedLocationMode !== 'all' ||
      sortOrder !== 'newest'
    )
  }, [search, selectedStatus, selectedCategory, selectedLocationMode, sortOrder])

  const handleResetFilters = () => {
    setSearch('')
    setSelectedStatus('all')
    setSelectedCategory('all')
    setSelectedLocationMode('all')
    setSortOrder('newest')
  }

  const getStatusBadgeClass = (status: AdminRequestStatus) => {
    switch (status) {
      case 'pending':
        return styles.statusPending
      case 'needs_changes':
        return styles.statusNeedsChanges
      case 'approved':
        return styles.statusApproved
      case 'rejected':
        return styles.statusRejected
      default:
        return ''
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Заявки на мероприятия</h1>
        <p className={styles.pageSubtitle}>
          Модерация предложений от пользователей платформы «Тут и Там»
        </p>
      </div>

      {/* Summary counters / tabs bar */}
      <div className={styles.statsBar}>
        <button
          type="button"
          className={`${styles.statTab} ${selectedStatus === 'all' ? styles.active : ''}`}
          onClick={() => setSelectedStatus('all')}
        >
          <span>Все заявки</span>
          <span className={styles.statCount}>{stats.total}</span>
        </button>

        <button
          type="button"
          className={`${styles.statTab} ${selectedStatus === 'pending' ? styles.active : ''}`}
          onClick={() => setSelectedStatus('pending')}
        >
          <span>На проверке</span>
          <span
            className={`${styles.statCount} ${stats.pending > 0 ? styles.statCountPending : ''}`}
          >
            {stats.pending}
          </span>
        </button>

        <button
          type="button"
          className={`${styles.statTab} ${selectedStatus === 'needs_changes' ? styles.active : ''}`}
          onClick={() => setSelectedStatus('needs_changes')}
        >
          <span>Нужны уточнения</span>
          <span className={styles.statCount}>{stats.needsChanges}</span>
        </button>

        <button
          type="button"
          className={`${styles.statTab} ${selectedStatus === 'approved' ? styles.active : ''}`}
          onClick={() => setSelectedStatus('approved')}
        >
          <span>Одобрены</span>
          <span className={styles.statCount}>{stats.approved}</span>
        </button>

        <button
          type="button"
          className={`${styles.statTab} ${selectedStatus === 'rejected' ? styles.active : ''}`}
          onClick={() => setSelectedStatus('rejected')}
        >
          <span>Отклонены</span>
          <span className={styles.statCount}>{stats.rejected}</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div className={styles.searchBox}>
            <IconSearch size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Поиск по названию, автору, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearch('')}
                aria-label="Очистить поиск"
              >
                <IconX size={14} />
              </button>
            )}
          </div>

          <select
            className={styles.filterSelect}
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as AdminRequestStatus | 'all')
            }
          >
            <option value="all">Все статусы</option>
            <option value="pending">На проверке</option>
            <option value="needs_changes">Нужны уточнения</option>
            <option value="approved">Одобрено</option>
            <option value="rejected">Отклонено</option>
          </select>

          <select
            className={styles.filterSelect}
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value as EventCategory | 'all')
            }
          >
            <option value="all">Все категории</option>
            <option value="events">Мероприятия</option>
            <option value="sports">Спорт</option>
            <option value="volunteer">Волонтёрство</option>
            <option value="parks">Парки</option>
            <option value="places">Места</option>
          </select>

          <select
            className={styles.filterSelect}
            value={selectedLocationMode}
            onChange={(e) =>
              setSelectedLocationMode(e.target.value as LocationMode | 'all')
            }
          >
            <option value="all">Формат места: Все</option>
            <option value="point">Точка на карте</option>
            <option value="area">Зона проведения</option>
          </select>

          <select
            className={styles.filterSelect}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className={styles.resetFiltersBtn}
              onClick={handleResetFilters}
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>Загрузка данных...</div>
          </div>
        ) : requests.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>Заявок не найдено</div>
            <p className={styles.emptyText}>
              По заданным критериям фильтрации нет ни одной заявки. Попробуйте
              сбросить фильтры.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                className={styles.resetFiltersBtn}
                onClick={handleResetFilters}
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>Название</th>
                  <th className={styles.th}>Автор</th>
                  <th className={styles.th}>Категория</th>
                  <th className={styles.th}>Дата проведения</th>
                  <th className={styles.th}>Место</th>
                  <th className={styles.th}>Подано</th>
                  <th className={styles.th}>Статус</th>
                  <th className={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className={styles.tr}
                    onClick={() => navigate(`/requests/${req.id}`)}
                  >
                    <td className={`${styles.td} ${styles.idCell}`}>
                      #{req.id}
                    </td>
                    <td className={`${styles.td} ${styles.titleCell}`}>
                      {req.title}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.authorCell}>
                        <span className={styles.authorName}>
                          {req.author.name}
                        </span>
                        <span className={styles.authorId}>
                          {req.author.id}
                        </span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.categoryBadge}>
                        {getCategoryLabel(req.category)}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.dateCell}`}>
                      {formatDateTimeRange(
                        req.startDate,
                        req.startTime,
                        req.endDate,
                        req.endTime,
                      )}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.locationCell}>
                        <span className={styles.locationAddress} title={req.address}>
                          {req.address}
                        </span>
                        <span className={styles.locationTypeBadge}>
                          {req.locationMode === 'point' ? (
                            <>
                              <IconMapPin size={12} />
                              <span>Точка</span>
                            </>
                          ) : (
                            <>
                              <IconPolygon size={12} />
                              <span>
                                Зона ({req.locationArea?.points.length || 0})
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className={`${styles.td} ${styles.timeAgo}`}>
                      {formatSubmissionTime(req.submittedAt)}
                    </td>
                    <td className={styles.td}>
                      <span
                        className={`${styles.statusBadge} ${getStatusBadgeClass(
                          req.status,
                        )}`}
                      >
                        <span className={styles.statusDot} />
                        {getStatusLabel(req.status)}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <button
                        type="button"
                        className={styles.openLink}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/requests/${req.id}`)
                        }}
                      >
                        <span>Открыть</span>
                        <IconArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
