import React, { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconTrash } from '../Icons'
import styles from './ChatTopBar.module.css'

interface ChatTopBarProps {
  onClear: () => void
  canClear: boolean
}

export const ChatTopBar: React.FC<ChatTopBarProps> = ({ onClear, canClear }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const closeOnOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <header className={styles.topBarWrapper}>
      <div className={styles.topBar}>
        <h1 className={styles.brandLockup}>
          <img src="/brand/tut-i-tam-logo-128.png" alt="" className={styles.brandLogo} />
          <span className={styles.brandTitle}>{t('app.name')}</span>
        </h1>
        <div className={styles.menuRoot} ref={rootRef}>
          <button
            type="button"
            className={styles.moreButton}
            aria-label={t('chat.more')}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((current) => !current)}
          >
            <span className={styles.moreDots} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
          {open && (
            <div className={styles.menu} id={menuId} role="menu">
              <button
                type="button"
                role="menuitem"
                className={styles.menuItem}
                disabled={!canClear}
                onClick={() => {
                  setOpen(false)
                  onClear()
                }}
              >
                <IconTrash size={16} />
                <span>{t('chat.clearHistory')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
