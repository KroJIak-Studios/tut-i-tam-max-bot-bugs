import React, { useState, useRef, useEffect } from 'react'
import type { CatalogSort } from '../../types'
import { IconChevronDown, IconCheck } from '../Icons'
import styles from './CatalogSortDropdown.module.css'

interface CatalogSortDropdownProps {
  value: CatalogSort
  onChange: (sort: CatalogSort) => void
}

const SORT_OPTIONS: Array<{ id: CatalogSort; label: string }> = [
  { id: 'distance', label: 'Сначала рядом' },
  { id: 'date', label: 'Сначала раньше' },
  { id: 'popular', label: 'Сначала популярные' },
  { id: 'price', label: 'Сначала дешевле' },
]

export const CatalogSortDropdown: React.FC<CatalogSortDropdownProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeOption = SORT_OPTIONS.find((opt) => opt.id === value) || SORT_OPTIONS[0]

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
        aria-label={`Сортировка: ${activeOption.label}`}
      >
        <span>{activeOption.label}</span>
        <span
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          aria-hidden="true"
        >
          <IconChevronDown size={13} color="currentColor" />
        </span>
      </button>

      {isOpen && (
        <div className={styles.menu} role="listbox" aria-label="Варианты сортировки">
          {SORT_OPTIONS.map((option) => {
            const isSelected = option.id === value
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`${styles.menuItem} ${isSelected ? styles.menuItemSelected : ''}`}
                onClick={() => handleSelect(option.id)}
              >
                <span className={styles.optionLabel}>{option.label}</span>
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
