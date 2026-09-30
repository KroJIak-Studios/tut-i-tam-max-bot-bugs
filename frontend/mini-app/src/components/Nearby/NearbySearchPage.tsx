import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { findNearbyEvent } from '../../services/nearbyService'
import styles from './NearbySearchPage.module.css'

type NearbyState = 'searching' | 'empty'

export const NearbySearchPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [state, setState] = useState<NearbyState>('searching')

  useEffect(() => {
    let active = true
    findNearbyEvent()
      .then((event) => {
        if (!active) return
        if (event) navigate(`/events/${event.id}`, { replace: true })
        else setState('empty')
      })
      .catch(() => {
        if (active) setState('empty')
      })
    return () => {
      active = false
    }
  }, [navigate])

  return (
    <main className={styles.page}>
      {state === 'searching' ? (
        <div className={styles.card} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          <p>{t('home.nearby.searching')}</p>
        </div>
      ) : (
        <div className={styles.card}>
          <p>{t('home.nearby.empty')}</p>
          <button type="button" className={styles.back} onClick={() => navigate('/')}>
            {t('home.nearby.back')}
          </button>
        </div>
      )}
    </main>
  )
}
