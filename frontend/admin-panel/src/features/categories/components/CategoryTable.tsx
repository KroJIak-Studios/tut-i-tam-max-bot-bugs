import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { getLocaleNativeName, splitCategoryNames } from '../constants'
import type { EventCategory, LocaleItem } from '../types'
import styles from './CategoriesView.module.css'

export interface CategoryTableProps {
  categories: EventCategory[]
  locales: LocaleItem[]
  fallbackLocale: string
  onEdit: (category: EventCategory) => void
  onDelete: (category: EventCategory) => void
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  locales,
  fallbackLocale,
  onEdit,
  onDelete,
}) => {
  const fallbackVisualName = getLocaleNativeName(fallbackLocale, locales)

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={`${styles.th} ${styles.thId}`}>ID</th>
            <th className={`${styles.th} ${styles.thPrimary}`}>
              Основное название ({fallbackVisualName})
            </th>
            <th className={`${styles.th} ${styles.thTranslations}`}>
              Дополнительные переводы
            </th>
            <th className={`${styles.th} ${styles.thActions}`}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const { primaryName, otherTranslations } = splitCategoryNames(
              category.names,
              fallbackLocale,
            )

            return (
              <tr key={category.id} className={styles.tr}>
                <td className={styles.td}>
                  <span className={styles.idBadge}>#{category.id}</span>
                </td>
                <td className={styles.td}>
                  <span className={styles.primaryText}>
                    {primaryName || <span className={styles.noTransHint}>—</span>}
                  </span>
                </td>
                <td className={styles.td}>
                  {otherTranslations.length === 0 ? (
                    <span className={styles.noTransHint}>Нет других переводов</span>
                  ) : (
                    <div className={styles.translationsList}>
                      {otherTranslations.map((trans) => (
                        <div
                          key={`${category.id}-${trans.locale_code}`}
                          className={styles.transChip}
                          title={`${getLocaleNativeName(trans.locale_code, locales)} (${trans.locale_code}): ${trans.text}`}
                        >
                          <span className={styles.localeCode}>{trans.locale_code}</span>
                          <span className={styles.transText}>{trans.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className={styles.td}>
                  <div className={styles.actionsCell}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => onEdit(category)}
                      aria-label={`Редактировать категорию ${primaryName || category.id}`}
                      title="Редактировать"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={() => onDelete(category)}
                      aria-label={`Удалить категорию ${primaryName || category.id}`}
                      title="Удалить"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
