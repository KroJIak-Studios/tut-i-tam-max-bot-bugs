import React, { useMemo, useState } from 'react'
import {
  Pencil,
  Search,
  X,
  Plus,
  FolderOpen,
} from 'lucide-react'
import type {
  InterestItem,
  Locale,
} from '../types'
import {
  getPrimaryName,
  getSecondaryTranslations,
  getLocaleNativeName,
} from '../utils/localeUtils'
import styles from './InterestsList.module.css'

interface InterestsListProps {
  interests: InterestItem[]
  locales: Locale[]
  fallbackLocaleCode: string
  onEdit: (interest: InterestItem) => void
  onCreateClick: () => void
}

export const InterestsList: React.FC<InterestsListProps> = ({
  interests,
  locales,
  fallbackLocaleCode,
  onEdit,
  onCreateClick,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredInterests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return interests

    return interests.filter((item) => {
      if (String(item.id).includes(query)) return true
      return item.names.some((n) => n.text.toLowerCase().includes(query))
    })
  }, [interests, searchQuery])

  if (interests.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FolderOpen size={36} color="var(--color-text-muted, #64748b)" />
        <h3 className={styles.emptyStateTitle}>Интересы не найдены</h3>
        <p className={styles.emptyStateText}>
          В справочнике пока нет интересов. Вы можете создать первый интерес с
          локализацией названий.
        </p>
        <button
          type="button"
          onClick={onCreateClick}
          className={styles.editBtn}
          style={{
            backgroundColor: 'var(--color-primary, #2563eb)',
            color: '#ffffff',
            borderColor: 'transparent',
            height: '40px',
            padding: '0 16px',
            marginTop: '8px',
          }}
        >
          <Plus size={16} />
          <span>Добавить интерес</span>
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Поиск по названию или ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Поиск по интересам"
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => setSearchQuery('')}
              aria-label="Очистить поиск"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className={styles.statsText}>
          {searchQuery ? (
            <>
              Найдено: <strong>{filteredInterests.length}</strong> из{' '}
              {interests.length}
            </>
          ) : (
            <>
              Всего интересов: <strong>{interests.length}</strong>
            </>
          )}
        </div>
      </div>

      {filteredInterests.length === 0 ? (
        <div className={styles.emptyState}>
          <Search size={32} color="var(--color-text-muted, #64748b)" />
          <h3 className={styles.emptyStateTitle}>Ничего не найдено</h3>
          <p className={styles.emptyStateText}>
            По запросу «{searchQuery}» совпадений не обнаружено.
          </p>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => setSearchQuery('')}
          >
            Сбросить фильтр
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Основное название</th>
                  <th>Дополнительные переводы</th>
                  <th style={{ textAlign: 'right', width: '130px' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterests.map((item) => {
                  const primaryText = getPrimaryName(item, fallbackLocaleCode)
                  const secondaryNames = getSecondaryTranslations(
                    item,
                    fallbackLocaleCode,
                  )

                  return (
                    <tr key={item.id}>
                      <td className={styles.idCell}>#{item.id}</td>
                      <td className={styles.nameCell}>
                        <div className={styles.primaryName}>
                          {item.color && (
                            <span
                              className={styles.colorSwatch}
                              style={{ backgroundColor: item.color }}
                              title={`Цвет: ${item.color}`}
                            />
                          )}
                          <span>{primaryText || '—'}</span>
                          <span className={styles.primaryLocaleCode}>
                            {fallbackLocaleCode}
                          </span>
                        </div>
                      </td>
                      <td className={styles.translationsCell}>
                        {secondaryNames.length > 0 ? (
                          <div className={styles.translationsList}>
                            {secondaryNames.map((tr) => (
                              <span
                                key={tr.locale_code}
                                className={styles.translationPill}
                                title={`${getLocaleNativeName(
                                  locales,
                                  tr.locale_code,
                                )}: ${tr.text}`}
                              >
                                <span className={styles.transLocale}>
                                  {tr.locale_code}
                                </span>
                                <span className={styles.transText}>
                                  {tr.text}
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className={styles.noTransText}>
                            Нет переводов
                          </span>
                        )}
                      </td>
                      <td className={styles.actionsCell}>
                        <button
                          type="button"
                          className={styles.editBtn}
                          onClick={() => onEdit(item)}
                          aria-label={`Редактировать интерес ${primaryText}`}
                        >
                          <Pencil size={14} />
                          <span>Изменить</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className={styles.mobileCards}>
            {filteredInterests.map((item) => {
              const primaryText = getPrimaryName(item, fallbackLocaleCode)
              const secondaryNames = getSecondaryTranslations(
                item,
                fallbackLocaleCode,
              )

              return (
                <div key={item.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <h4 className={styles.cardTitle}>
                      {item.color && (
                        <span
                          className={styles.colorSwatch}
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                      <span>{primaryText || '—'}</span>
                    </h4>
                    <span className={styles.cardIdBadge}>#{item.id}</span>
                  </div>

                  {secondaryNames.length > 0 && (
                    <div className={styles.cardTranslations}>
                      <span className={styles.cardTranslationsLabel}>
                        Переводы ({secondaryNames.length}):
                      </span>
                      <div className={styles.cardTranslationsChips}>
                        {secondaryNames.map((tr) => (
                          <span
                            key={tr.locale_code}
                            className={styles.translationPill}
                          >
                            <span className={styles.transLocale}>
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
                      <span>Редактировать интерес</span>
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
