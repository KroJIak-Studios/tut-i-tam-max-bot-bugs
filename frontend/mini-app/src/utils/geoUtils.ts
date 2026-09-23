/**
 * Geographical distance calculations using the Haversine formula.
 * No external libraries needed.
 */

/**
 * Calculates distance in meters between two lat/lng points.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const deltaPhi = toRad(lat2 - lat1)
  const deltaLambda = toRad(lon2 - lon1)

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Formats distance in Russian locale format:
 * - < 1000m: "420 м", "850 м" (rounded to nearest 10m)
 * - >= 1000m: "1,2 км", "2,7 км" (1 decimal place with comma)
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    const rounded = Math.round(meters / 10) * 10
    return `${rounded || 50} м`
  }
  const km = (meters / 1000).toFixed(1).replace('.', ',')
  return `${km} км`
}
