import { ASSISTANT_API_BASE_URL, apiRequest } from './api'

export interface NearbyEventResult {
  id: number
}

type Point = { latitude: number; longitude: number }

let pendingPoint: Promise<Point | null> | null = null

export function beginNearbySearch(): void {
  pendingPoint = readBrowserPoint()
}

export async function findNearbyEvent(): Promise<NearbyEventResult | null> {
  const point = await (pendingPoint ?? readBrowserPoint())
  pendingPoint = null
  return apiRequest<NearbyEventResult | null>('/recommendations/app/nearby', {
    method: 'POST',
    body: JSON.stringify(point ?? {}),
  }, ASSISTANT_API_BASE_URL)
}

function readBrowserPoint(): Promise<Point | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    )
  })
}
