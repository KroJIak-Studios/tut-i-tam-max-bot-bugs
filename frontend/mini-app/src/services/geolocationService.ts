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
  let disposed = false
  const stopWatch = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    watchId = null
  }
  const options: PositionOptions = { enableHighAccuracy: true, maximumAge: 10_000, timeout: 30_000 }
  const emitPosition = (position: GeolocationPosition) => onUpdate({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy })
  const start = () => {
    if (disposed || document.hidden || watchId !== null) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (disposed) return
        emitPosition(position)
        watchId = navigator.geolocation.watchPosition(emitPosition, (error) => { stopWatch(); onError(error) }, options)
      },
      (error) => {
        if (disposed) return
        onError(error)
      },
      options,
    )
  }
  const handleVisibility = () => document.hidden ? stopWatch() : start()
  const handlePageHide = () => stop()
  const stop = () => {
    disposed = true
    stopWatch()
    document.removeEventListener('visibilitychange', handleVisibility)
    window.removeEventListener('pagehide', handlePageHide)
  }
  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('pagehide', handlePageHide)
  start()
  return stop
}
