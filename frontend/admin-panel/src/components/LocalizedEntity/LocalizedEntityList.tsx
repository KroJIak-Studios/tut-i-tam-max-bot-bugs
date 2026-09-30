import React, { useMemo } from 'react'
import { Pencil, Trash2, Search, X, Plus, FolderOpen } from 'lucide-react'
import type { LocalizedEntity, LocalizedEntityListProps } from './types'
import { getPrimaryName, getSecondaryNames, getLocaleNativeName } from './localeUtils'
import styles from './LocalizedEntityList.module.css'

/**
 * Reusable table+mobile-card list for localized entities (Categories, Interests).
 * Domain-specific logic (API, state, modals) stays in each feature.
 */
export function LocalizedEntityList<T extends LocalizedEntity>({
  items,
  locales,
  fallbackLocaleCode,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onCreateClick,
  entityLabel,
  countLabel,
  getCount,
  createButtonLabel,
  emptyTitle,
  emptyText,
}: LocalizedEntityListProps<T>): React.ReactElement {
  const fallbackLocaleName = getLocaleNativeName(fallbackLocaleCode, locales)
  const showCount = Boolean(countLabel && getCount)

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => {
      if (String(item.id).includes(q)) return true
      return item.names.some(
        (n) =>
          n.text.toLowerCase().includes(q) ||
          n.locale_code.toLowerCase().includes(q),
      )
    })
  }, [items, searchQuery])

  return (
    <div className={styles.container}>
      {/* Search bar + create button */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder={`Поиск ${entityLabel.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label={`Поиск по ${entityLabel.toLowerCase()}`}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => onSearchChange('')}
              aria-label="Очистить поиск"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <button
          type="button"
          className={styles.createBtn}
          onClick={onCreateClick}
        >
          <Plus size={15} />
          <span>{createButtonLabel}</span>
        </button>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className={styles.emptyState}>
          <FolderOpen size={36} color="var(--color-text-muted)" />
          <h3 className={styles.emptyTitle}>{emptyTitle}</h3>
          <p className={styles.emptyText}>{emptyText}</p>
          <button
            type="button"
            className={styles.emptyCreateBtn}
            onClick={onCreateClick}
          >
            <Plus size={15} />
            <span>{createButtonLabel}</span>
          </button>
        </div>
      )}

      {/* No search results */}
      {items.length > 0 && filtered.length === 0 && (
        <div className={styles.emptyState}>
          <Search size={28} color="var(--color-text-muted)" />
          <h3 className={styles.emptyTitle}>Ничего не найдено</h3>
          <p className={styles.emptyText}>
            По запросу «{searchQuery}» нет совпадений.
          </p>
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => onSearchChange('')}
          >
            Сбросить поиск
          </button>
        </div>
      )}

      {filtered.length > 0 && (
        <>
          {/* Desktop table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={`${styles.th} ${styles.thId}`}>ID</th>
                  <th className={`${styles.th} ${styles.thPrimary}`}>
                    Основное название ({fallbackLocaleName})
                  </th>
                  <th className={`${styles.th} ${styles.thTranslations}`}>
                    Дополнительные переводы
                  </th>
                  {showCount && (
                    <th className={`${styles.th} ${styles.thCount}`}>
                      {countLabel}
                    </th>
                  )}
                  <th className={`${styles.th} ${styles.thActions}`}>
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const primaryName = getPrimaryName(item.names, fallbackLocaleCode)
                  const secondary = getSecondaryNames(item.names, fallbackLocaleCode)
                  const count = getCount?.(item)

                  return (
                    <tr key={item.id} className={styles.tr}>
                      <td className={styles.td}>
                        <span className={styles.idBadge}>#{item.id}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.primaryText}>
                          {primaryName || (
                            <span className={styles.noTrans}>—</span>
                          )}
                        </span>
                      </td>
                      <td className={styles.td}>
                        {secondary.length === 0 ? (
                          <span className={styles.noTrans}>
                            Нет других переводов
                          </span>
                        ) : (
                          <div className={styles.translationsList}>
                            {secondary.map((trans) => (
                              <span
                                key={`${item.id}-${trans.locale_code}`}
                                className={styles.transChip}
                                title={`${getLocaleNativeName(trans.locale_code, locales)} (${trans.locale_code}): ${trans.text}`}
                              >
                                <span className={styles.localeCode}>
                                  {trans.locale_code}
                                </span>
                                <span className={styles.transText}>
                                  {trans.text}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      {showCount && (
                        <td className={`${styles.td} ${styles.countCell}`}>
                          {count === null || count === undefined ? (
                            <span className={styles.noTrans}>—</span>
                          ) : (
                            <span className={styles.countValue}>
                              {count.toLocaleString('ru-RU')}
                            </span>
                          )}
                        </td>
                      )}
                      <td className={styles.td}>
                        <div className={styles.actionsCell}>
                          <button
                            type="button"
                            className={styles.editBtn}
                            onClick={() => onEdit(item)}
                            aria-label={`Редактировать ${entityLabel.toLowerCase()} ${primaryName || item.id}`}
                          >
                            <Pencil size={14} />
                            <span>Изменить</span>
                          </button>
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => onDelete(item)}
                            aria-label={`Удалить ${entityLabel.toLowerCase()} ${primaryName || item.id}`}
                            title="Удалить"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className={styles.mobileCards}>
            {filtered.map((item) => {
              const primaryName = getPrimaryName(item.names, fallbackLocaleCode)
              const secondary = getSecondaryNames(item.names, fallbackLocaleCode)
              const count = getCount?.(item)

              return (
                <div key={item.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardMainRow}>
                      <h4 className={styles.cardTitle}>
                        {primaryName || (
                          <span className={styles.noTrans}>Без названия</span>
                        )}
                      </h4>
                      <span className={styles.idBadge}>#{item.id}</span>
                    </div>

                    {showCount && (
                      <div className={styles.cardCount}>
                        <span className={styles.cardCountLabel}>{countLabel}:</span>
                        <span className={styles.cardCountValue}>
                          {count?.toLocaleString('ru-RU') ?? '—'}
                        </span>
                      </div>
                    )}
                  </div>

                  {secondary.length > 0 && (
                    <div className={styles.cardTranslations}>
                      <span className={styles.cardTransLabel}>
                        Переводы ({secondary.length}):
                      </span>
                      <div className={styles.cardTransChips}>
                        {secondary.map((tr) => (
                          <span
                            key={tr.locale_code}
                            className={styles.transChip}
                          >
                            <span className={styles.localeCode}>
                              {tr.locale_code}
                            </span>
                            <span className={styles.transText}>{tr.text}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.cardEditBtn}
                      onClick={() => onEdit(item)}
                    >
                      <Pencil size={15} />
                      <span>Редактировать</span>
                    </button>
                    <button
                      type="button"
                      className={styles.cardDeleteBtn}
                      onClick={() => onDelete(item)}
                      aria-label={`Удалить ${entityLabel.toLowerCase()} ${primaryName || item.id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
