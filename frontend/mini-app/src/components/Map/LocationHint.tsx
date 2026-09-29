import React from 'react'
import { useTranslation } from 'react-i18next'
import type { GeolocationStatus } from '../../context/GeolocationContext'
import styles from './LocationHint.module.css'

interface Props {
  status: GeolocationStatus
  onRequest: () => void
  onRetry: () => void
}

export const LocationHint: React.FC<Props> = ({ status, onRequest, onRetry }) => {
  const { t } = useTranslation()
  if (status === 'watching') return null
  const denied = status === 'denied'
  const unavailable = status === 'unavailable'
  const error = status === 'error'
  const message = denied
    ? t('geolocation.permissionDenied')
    : unavailable
      ? t('geolocation.unavailableDescription')
      : error
        ? t('geolocation.errorDescription')
        : t('geolocation.locationMapHint')
  const action = unavailable ? null : denied ? onRequest : status === 'idle' ? onRequest : onRetry
  const actionLabel = status === 'idle' ? t('geolocation.retryButton') : t('geolocation.retry')
  return <div className={styles.hint} role="status">
    <span className={styles.marker} aria-hidden="true">⌖</span>
    <span className={styles.message}>{message}</span>
    {action && <button type="button" className={styles.action} onClick={action}>{actionLabel}</button>}
  </div>
}
