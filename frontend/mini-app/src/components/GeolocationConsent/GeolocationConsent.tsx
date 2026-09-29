import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGeolocation } from '../../context/GeolocationContext'
import styles from './GeolocationConsent.module.css'

export const GeolocationConsent: React.FC = () => {
  const { t } = useTranslation()
  const { status, request, decline, retry } = useGeolocation()
  const showRequest = status === 'prompt' || status === 'declined' || status === 'denied' || status === 'unavailable' || status === 'error'
  if (!showRequest) return null
  const firstRequest = status === 'prompt'
  const title = firstRequest ? t('geolocation.title') : status === 'declined' ? t('geolocation.declinedTitle') : status === 'denied' ? t('geolocation.deniedTitle') : t('geolocation.errorTitle')
  const message = firstRequest ? t('geolocation.description') : status === 'declined' ? t('geolocation.declinedDescription') : status === 'denied' ? t('geolocation.deniedDescription') : status === 'unavailable' ? t('geolocation.unavailableDescription') : t('geolocation.errorDescription')
  return <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="geolocation-title">
    <section className={styles.panel}>
      <div className={styles.icon} aria-hidden="true">⌖</div>
      <h2 id="geolocation-title" className={styles.title}>{title}</h2>
      <p className={styles.description}>{message}</p>
      <div className={styles.actions}>
        {(firstRequest || status === 'declined') ? <button type="button" className={styles.secondary} onClick={decline}>{t('geolocation.later')}</button> : null}
        <button type="button" className={styles.primary} onClick={firstRequest ? request : retry}>{t(firstRequest ? 'geolocation.allow' : 'geolocation.retry')}</button>
      </div>
    </section>
  </div>
}
