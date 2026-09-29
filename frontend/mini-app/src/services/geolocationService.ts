export interface GeoPoint {
  latitude: number
  longitude: number
  accuracy: number
}

export function watchUserLocation(onUpdate: (point: GeoPoint) => void, onError: (error: GeolocationPositionError) => void): () => void {
  if (!navigator.geolocation) {
    onError({ code: 2, message: 'geolocation_unavailable' } as GeolocationPositionError)
    return () => undefined
  }
  let watchId: number | null = null
  const stop = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    watchId = null
  }
  const start = () => {
    watchId = navigator.geolocation.watchPosition(
      (position) => onUpdate({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy }),
      onError,
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
    )
  }
  start()
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (watchId === null) start() })
  window.addEventListener('pagehide', stop, { once: true })
  return stop
}
