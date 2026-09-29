import React from 'react'
import { useTranslation } from 'react-i18next'
import { IconFilter } from '../Icons'
import styles from './CatalogEmptyState.module.css'

interface CatalogEmptyStateProps {
  onResetFilters: () => void
  hasActiveFilters: boolean
}

export const CatalogEmptyState: React.FC<CatalogEmptyStateProps> = ({ onResetFilters, hasActiveFilters }) => {
  const { t } = useTranslation()
  return <div className={styles.emptyContainer} role="status">
    <div className={styles.iconCircle} aria-hidden="true"><IconFilter size={24} color="#6B7280" /></div>
    <h3 className={styles.title}>{t('catalog.emptyTitle')}</h3>
    <p className={styles.description}>{t('catalog.emptyDescription')}</p>
    {hasActiveFilters && <button type="button" className={styles.resetBtn} onClick={onResetFilters}>{t('catalog.resetFilters')}</button>}
  </div>
}
