import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MapEvent } from '../../types'
import { getMyEventRequests } from '../../services/mapService'
import { PlanRequestCard } from './PlanRequestCard'
import { PlansEmptyState } from './PlansEmptyState'
import { PlansSkeleton } from './PlansSkeleton'
import styles from './PlansPage.module.css'

interface PlansRequestsListProps {
  onOpen: (eventId: string) => void
  onCreate: () => void
  onCount: (count: number) => void
}

export const PlansRequestsList: React.FC<PlansRequestsListProps> = ({ onOpen, onCreate, onCount }) => {
  const { t } = useTranslation()
  const [requests, setRequests] = useState<MapEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const load = useCallback(() => {
    let active = true
    setLoading(true)
    getMyEventRequests()
      .then((items) => {
        if (!active) return
        setRequests(items)
        setFailed(false)
        onCount(items.length)
      })
      .catch(() => {
        if (!active) return
        setFailed(true)
        onCount(0)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [onCount])

  useEffect(() => {
    const cancel = load()
    return cancel
  }, [load])

  if (loading) return <PlansSkeleton />
  if (failed) {
    return (
      <div className={styles.requestError} role="alert">
        <p>{t('plans.requests.loadError')}</p>
        <button type="button" onClick={() => load()}>{t('common.retry')}</button>
      </div>
    )
  }
  if (requests.length === 0) return <PlansEmptyState type="requests" onCreate={onCreate} />
  return (
    <div className={styles.cardsList}>
      {requests.map((event) => (
        <PlanRequestCard key={event.id} event={event} onClick={onOpen} />
      ))}
    </div>
  )
}
