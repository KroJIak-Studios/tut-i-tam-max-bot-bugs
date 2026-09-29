import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supportsPreciseGeolocation, watchUserLocation, type GeoPoint } from '../services/geolocationService'

export type GeolocationStatus = 'idle' | 'requesting' | 'watching' | 'denied' | 'unavailable' | 'error'
interface GeolocationValue {
  point: GeoPoint | null
  status: GeolocationStatus
  request: () => void
  retry: () => void
  enterMap: () => void
  leaveMap: () => void
}

const GeolocationContext = createContext<GeolocationValue | null>(null)
export const GeolocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [point, setPoint] = useState<GeoPoint | null>(null)
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const stopWatchingRef = useRef<(() => void) | null>(null)
  const mapIsActiveRef = useRef(false)
  const attemptIdRef = useRef(0)

  const stopWatching = useCallback(() => {
    attemptIdRef.current += 1
    stopWatchingRef.current?.()
    stopWatchingRef.current = null
  }, [])

  const startWatching = useCallback(() => {
    if (!mapIsActiveRef.current) return
    stopWatching()
    const attemptId = attemptIdRef.current
    if (!navigator.geolocation) {
      setStatus('unavailable')
      return
    }

    setStatus('requesting')
    stopWatchingRef.current = watchUserLocation(
      (nextPoint) => {
        if (!mapIsActiveRef.current || attemptId !== attemptIdRef.current) return
        setPoint(nextPoint)
        setStatus('watching')
      },
      (error) => {
        if (!mapIsActiveRef.current || attemptId !== attemptIdRef.current) return
        setStatus(error.code === 1 ? 'denied' : error.message === 'geolocation_unavailable' ? 'unavailable' : 'error')
      },
    )
  }, [stopWatching])

  const enterMap = useCallback(() => {
    mapIsActiveRef.current = true
    if (!supportsPreciseGeolocation()) {
      setStatus('unavailable')
      return
    }
    if (navigator.permissions?.query) {
      void navigator.permissions.query({ name: 'geolocation' }).then((permission) => {
        if (!mapIsActiveRef.current) return
        if (permission.state === 'granted') startWatching()
        else if (permission.state === 'denied') setStatus('denied')
        else setStatus('idle')
      }).catch(() => {
        if (mapIsActiveRef.current) setStatus('idle')
      })
      return
    }

    setStatus('idle')
  }, [startWatching])

  const leaveMap = useCallback(() => {
    mapIsActiveRef.current = false
    stopWatching()
    setPoint(null)
    setStatus('idle')
  }, [stopWatching])

  const request = useCallback(() => {
    startWatching()
  }, [startWatching])

  const retry = useCallback(() => {
    startWatching()
  }, [startWatching])

  useEffect(() => () => {
    mapIsActiveRef.current = false
    stopWatching()
  }, [stopWatching])

  const value = useMemo(() => ({ point, status, request, retry, enterMap, leaveMap }), [point, status, request, retry, enterMap, leaveMap])
  return <GeolocationContext.Provider value={value}>{children}</GeolocationContext.Provider>
}

export function useGeolocation(): GeolocationValue {
  const context = useContext(GeolocationContext)
  if (!context) throw new Error('useGeolocation must be used within GeolocationProvider')
  return context
}
