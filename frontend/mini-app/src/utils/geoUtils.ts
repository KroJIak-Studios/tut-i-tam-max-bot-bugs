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
 * Formats distance with locale-native number formatting:
 * RU: "390 м", "1,4 км"
 * EN: "390 m", "1.4 km"
 */
export function formatDistance(meters: number, locale: string = 'ru-RU'): string {
  const normLocale = locale.startsWith('en') ? 'en-US' : 'ru-RU'
  const isEn = normLocale === 'en-US'

  if (meters < 1000) {
    const rounded = Math.round(meters / 10) * 10 || 50
    const formattedNum = new Intl.NumberFormat(normLocale).format(rounded)
    return `${formattedNum} ${isEn ? 'm' : 'м'}`
  }

  const km = meters / 1000
  const formattedKm = new Intl.NumberFormat(normLocale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(km)

  return `${formattedKm} ${isEn ? 'km' : 'км'}`
}
