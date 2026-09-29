import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { watchUserLocation, type GeoPoint } from '../services/geolocationService'

export type GeolocationStatus = 'prompt' | 'declined' | 'requesting' | 'watching' | 'denied' | 'unavailable' | 'error'
interface GeolocationValue { point: GeoPoint | null; status: GeolocationStatus; request: () => void; decline: () => void; retry: () => void }
const GeolocationContext = createContext<GeolocationValue | null>(null)
const CONSENT_KEY = 'tut_i_tam_location_consent'

function initialStatus(): GeolocationStatus {
  const consent = localStorage.getItem(CONSENT_KEY)
  return consent === 'granted' ? 'requesting' : consent === 'declined' ? 'declined' : 'prompt'
}

export const GeolocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [point, setPoint] = useState<GeoPoint | null>(null)
  const [status, setStatus] = useState<GeolocationStatus>(initialStatus)
  const stopWatchRef = useRef<(() => void) | null>(null)
  const runningRef = useRef(false)

  const startWatch = useCallback(() => {
    if (runningRef.current) return
    if (!navigator.geolocation) {
      setStatus('unavailable')
      return
    }
    runningRef.current = true
    setStatus('requesting')
    stopWatchRef.current = watchUserLocation(
      (nextPoint) => {
        setPoint(nextPoint)
        setStatus('watching')
        localStorage.setItem(CONSENT_KEY, 'granted')
      },
      (error) => {
        runningRef.current = false
        setStatus(error.code === 1 ? 'denied' : error.message === 'geolocation_unavailable' ? 'unavailable' : 'error')
      },
    )
  }, [])

  const request = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'granted')
    startWatch()
  }, [startWatch])

  const decline = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setStatus('declined')
  }, [])

  const retry = useCallback(() => {
    runningRef.current = false
    stopWatchRef.current?.()
    stopWatchRef.current = null
    startWatch()
  }, [startWatch])

  useEffect(() => {
    let active = true
    if (localStorage.getItem(CONSENT_KEY) !== 'granted' || !navigator.permissions?.query) return
    void navigator.permissions.query({ name: 'geolocation' }).then((permission) => {
      if (!active) return
      if (permission.state === 'granted') startWatch()
      else setStatus(permission.state === 'denied' ? 'denied' : 'prompt')
    }).catch(() => setStatus('prompt'))
    return () => { active = false }
  }, [startWatch])

  useEffect(() => () => {
    stopWatchRef.current?.()
    stopWatchRef.current = null
    runningRef.current = false
  }, [])

  const value = useMemo(() => ({ point, status, request, decline, retry }), [point, status, request, decline, retry])
  return <GeolocationContext.Provider value={value}>{children}</GeolocationContext.Provider>
}

export function useGeolocation(): GeolocationValue {
  const context = useContext(GeolocationContext)
  if (!context) throw new Error('useGeolocation must be used within GeolocationProvider')
  return context
}
