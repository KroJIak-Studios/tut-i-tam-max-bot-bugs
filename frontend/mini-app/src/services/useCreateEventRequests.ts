import { useState, useEffect, useCallback } from 'react'
import type { CreateEventRequest } from '../components/CreateEvent/types'
import {
  getCreateEventRequests,
  getStoredRequestsSync,
  REQUESTS_CHANGED_EVENT,
} from './createEventRequestService'

export function useCreateEventRequests() {
  const [requests, setRequests] = useState<CreateEventRequest[]>(() => getStoredRequestsSync())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getCreateEventRequests()
      setRequests(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const handleChanged = () => {
      fetchRequests()
    }

    window.addEventListener(REQUESTS_CHANGED_EVENT, handleChanged)
    window.addEventListener('storage', handleChanged)
    return () => {
      window.removeEventListener(REQUESTS_CHANGED_EVENT, handleChanged)
      window.removeEventListener('storage', handleChanged)
    }
  }, [fetchRequests])

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  return {
    requests,
    loading,
    error,
    pendingCount,
    refetch: fetchRequests,
  }
}
