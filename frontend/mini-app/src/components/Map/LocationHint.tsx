import React from 'react'
import { useTranslation } from 'react-i18next'
import type { GeolocationStatus } from '../../context/GeolocationContext'
import { IconCrosshair } from '../Icons'
import styles from './LocationHint.module.css'

interface Props {
  status: GeolocationStatus
  offset: boolean
  onRequest: () => void
  onRetry: () => void
}

export const LocationHint: React.FC<Props> = ({ status, offset, onRequest, onRetry }) => {
  const { t } = useTranslation()
  if (status === 'watching') return null
  const denied = status === 'denied'
  const message = denied
    ? t('geolocation.permissionDenied')
    : t('geolocation.locationMapHint')
  const action = status === 'unavailable' ? null : denied || status === 'idle' ? onRequest : onRetry
  const actionLabel = status === 'idle' || denied ? t('geolocation.retryButton') : t('geolocation.retry')
  return <div className={`${styles.hint} ${offset ? styles.offset : ''}`} role="status">
    <span className={styles.marker} aria-hidden="true"><IconCrosshair size={16} color="currentColor" /></span>
    <span>{message}</span>
    {action && <button type="button" className={styles.action} onClick={action}>{actionLabel}</button>}
  </div>
}
