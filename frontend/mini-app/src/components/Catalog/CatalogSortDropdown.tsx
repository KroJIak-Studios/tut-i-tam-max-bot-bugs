import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { CatalogSort } from '../../types'
import { IconChevronDown, IconCheck } from '../Icons'
import styles from './CatalogSortDropdown.module.css'

interface CatalogSortDropdownProps {
  value: CatalogSort
  onChange: (sort: CatalogSort) => void
}

const SORT_IDS: CatalogSort[] = ['distance', 'date', 'popular', 'price']

export const CatalogSortDropdown: React.FC<CatalogSortDropdownProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeLabel = t(`catalog.sortOptions.${value}`)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (sortId: CatalogSort) => {
    onChange(sortId)
    setIsOpen(false)
  }

  return (
    <div className={styles.dropdownContainer} ref={containerRef}>
      <button
        type="button"
        className={`${styles.triggerButton} ${isOpen ? styles.triggerActive : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${t('catalog.sortLabel')}: ${activeLabel}`}
      >
        <span>{activeLabel}</span>
        <span
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          aria-hidden="true"
        >
          <IconChevronDown size={13} color="currentColor" />
        </span>
      </button>

      {isOpen && (
        <div className={styles.menu} role="listbox" aria-label={t('catalog.sortOptionsAriaLabel')}>
          {SORT_IDS.map((sortId) => {
            const isSelected = sortId === value
            const label = t(`catalog.sortOptions.${sortId}`)
            return (
              <button
                key={sortId}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`${styles.menuItem} ${isSelected ? styles.menuItemSelected : ''}`}
                onClick={() => handleSelect(sortId)}
              >
                <span className={styles.optionLabel}>{label}</span>
                {isSelected && (
                  <IconCheck size={15} color="#2563EB" className={styles.checkIcon} />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

