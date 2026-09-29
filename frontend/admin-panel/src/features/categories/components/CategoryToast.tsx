import React, { useEffect } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import type { CategoryToastState } from '../types'
import styles from './CategoryToast.module.css'

export interface CategoryToastProps {
  toast: CategoryToastState | null
  onDismiss: () => void
  duration?: number
}

export const CategoryToast: React.FC<CategoryToastProps> = ({
  toast,
  onDismiss,
  duration = 4000,
}) => {
  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => {
      onDismiss()
    }, duration)

    return () => window.clearTimeout(timer)
  }, [toast, duration, onDismiss])

  if (!toast) return null

  const getStyleClass = () => {
    switch (toast.type) {
      case 'success':
        return styles.toastSuccess
      case 'error':
        return styles.toastError
      default:
        return styles.toastInfo
    }
  }

  const renderIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} />
      case 'error':
        return <AlertCircle size={18} />
      default:
        return <Info size={18} />
    }
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.toast} ${getStyleClass()}`} role="status">
        <div className={styles.content}>
          {renderIcon()}
          <span className={styles.message}>{toast.message}</span>
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onDismiss}
          aria-label="Закрыть уведомление"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
