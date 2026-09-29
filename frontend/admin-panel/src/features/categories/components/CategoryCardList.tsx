import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { getLocaleNativeName, splitCategoryNames } from '../constants'
import type { EventCategory, LocaleItem } from '../types'
import styles from './CategoriesView.module.css'

export interface CategoryCardListProps {
  categories: EventCategory[]
  locales: LocaleItem[]
  fallbackLocale: string
  onEdit: (category: EventCategory) => void
  onDelete: (category: EventCategory) => void
}

export const CategoryCardList: React.FC<CategoryCardListProps> = ({
  categories,
  locales,
  fallbackLocale,
  onEdit,
  onDelete,
}) => {
  return (
    <div className={styles.cardsList}>
      {categories.map((category) => {
        const { primaryName, otherTranslations } = splitCategoryNames(
          category.names,
          fallbackLocale,
        )

        return (
          <article key={category.id} className={styles.card}>
            <header className={styles.cardHeader}>
              <div className={styles.cardIdCol}>
                <span className={styles.idBadge}>#{category.id}</span>
              </div>
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.mobileActionBtn}
                  onClick={() => onEdit(category)}
                  aria-label={`Редактировать категорию ${primaryName || category.id}`}
                  title="Редактировать"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  className={`${styles.mobileActionBtn} ${styles.mobileActionBtnDanger}`}
                  onClick={() => onDelete(category)}
                  aria-label={`Удалить категорию ${primaryName || category.id}`}
                  title="Удалить"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </header>

            <div className={styles.cardBody}>
              <div className={styles.cardPrimaryName}>
                {primaryName || <span className={styles.noTransHint}>Без названия</span>}
              </div>

              {otherTranslations.length > 0 && (
                <div className={styles.cardTranslationsSection}>
                  <span className={styles.cardTranslationsLabel}>Переводы</span>
                  <div className={styles.translationsList}>
                    {otherTranslations.map((trans) => (
                      <div
                        key={`${category.id}-${trans.locale_code}`}
                        className={styles.transChip}
                        title={`${getLocaleNativeName(trans.locale_code, locales)} (${trans.locale_code})`}
                      >
                        <span className={styles.localeCode}>{trans.locale_code}</span>
                        <span className={styles.transText}>{trans.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
