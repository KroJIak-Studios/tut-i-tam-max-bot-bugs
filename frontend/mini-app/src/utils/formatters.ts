/**
 * Unified locale-aware formatters layer for Mini-App
 * Provides consistent formatting for dates, times, distances, and prices using Intl API.
 */
import { getIsoDate, parseIsoDate } from './dateUtils'

export type SupportedLocale = 'ru-RU' | 'en-US'

function normalizeLocale(locale?: string): SupportedLocale {
  if (locale && locale.startsWith('en')) {
    return 'en-US'
  }
  return 'ru-RU'
}

/**
 * Formats time string (e.g. "19:00" -> "19:00" in RU, "7:00 PM" in EN)
 */
export function formatTime(timeStr?: string, locale?: string): string {
  if (!timeStr) return ''
  const parts = timeStr.trim().split(':')
  if (parts.length < 2) return timeStr
  const h = Number(parts[0])
  const m = Number(parts[1])
  if (isNaN(h) || isNaN(m)) return timeStr

  const norm = normalizeLocale(locale)
  const d = new Date(2026, 0, 1, h, m)
  return new Intl.DateTimeFormat(norm, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

/**
 * Calculates default end time (startTime + 2 hours).
 * For same-day constraints, caps at 23:59.
 */
export function calculateDefaultEndTime(startTime: string): string {
  if (!startTime) return ''
  const parts = startTime.trim().split(':')
  if (parts.length < 2) return ''
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (isNaN(h) || isNaN(m)) return ''

  const endH = h + 2
  if (endH >= 24) {
    return '23:59'
  }
  return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Checks if timeB is strictly later than timeA on the same day.
 */
export function isTimeAfter(timeB: string, timeA: string): boolean {
  if (!timeA || !timeB) return false
  return timeB > timeA
}

/**
 * Formats event date and time according to locale:
 * RU: "Сегодня · 19:00", "Завтра · 10:00", "27 сентября · 18:30"
 * EN: "Today · 7:00 PM", "Tomorrow · 10:00 AM", "September 27 · 6:30 PM"
 */
export function formatEventDateTime(
  dateStr: string,
  startTime?: string,
  locale?: string
): string {
  const norm = normalizeLocale(locale)
  const isEn = norm === 'en-US'
  const today = getIsoDate(0)
  const tomorrow = getIsoDate(1)
  const formattedTime = startTime ? formatTime(startTime, norm) : ''
  const timeSuffix = formattedTime ? ` · ${formattedTime}` : ''

  const lower = dateStr.trim().toLowerCase()
  if (lower === 'сегодня' || lower === 'today' || dateStr === today) {
    return `${isEn ? 'Today' : 'Сегодня'}${timeSuffix}`
  }
  if (lower === 'завтра' || lower === 'tomorrow' || dateStr === tomorrow) {
    return `${isEn ? 'Tomorrow' : 'Завтра'}${timeSuffix}`
  }

  // Handle standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    try {
      const d = parseIsoDate(dateStr)
      const datePart = new Intl.DateTimeFormat(norm, {
        day: 'numeric',
        month: 'long',
      }).format(d)
      return `${datePart}${timeSuffix}`
    } catch {
      return `${dateStr}${timeSuffix}`
    }
  }

  // Handle Russian month names like "21 сентября"
  const ruMonthMatch = dateStr.trim().match(/^(\d{1,2})\s+([а-яё]+)$/i)
  if (ruMonthMatch) {
    const day = parseInt(ruMonthMatch[1], 10)
    const monthWord = ruMonthMatch[2].toLowerCase()
    const monthsRu = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
    ]
    const mIdx = monthsRu.indexOf(monthWord)
    if (mIdx !== -1 && !isNaN(day)) {
      const d = new Date(2026, mIdx, day)
      const datePart = new Intl.DateTimeFormat(norm, {
        day: 'numeric',
        month: 'long',
      }).format(d)
      return `${datePart}${timeSuffix}`
    }
  }

  return `${dateStr}${timeSuffix}`
}

/**
 * Formats event date and time range:
 * RU: "5 октября · 14:00–16:00"
 * EN: "October 5 · 2:00 PM–4:00 PM"
 */
export function formatEventDateTimeRange(
  dateStr: string,
  startTime?: string,
  endTime?: string,
  locale?: string
): string {
  if (!startTime) {
    return formatEventDateTime(dateStr, undefined, locale)
  }
  if (!endTime) {
    return formatEventDateTime(dateStr, startTime, locale)
  }

  const norm = normalizeLocale(locale)
  const formattedStart = formatTime(startTime, norm)
  const formattedEnd = formatTime(endTime, norm)
  const timeRange = `${formattedStart}–${formattedEnd}`

  const datePrefix = formatEventDateTime(dateStr, undefined, norm)
  return `${datePrefix} · ${timeRange}`
}

/**
 * Formats chip date (e.g. for filter bar):
 * RU: "Сегодня", "Завтра", "27 сент."
 * EN: "Today", "Tomorrow", "Sep 27"
 */
export function formatChipDate(isoDate: string, locale?: string): string {
  const norm = normalizeLocale(locale)
  const isEn = norm === 'en-US'
  const today = getIsoDate(0)
  const tomorrow = getIsoDate(1)

  if (isoDate === today) return isEn ? 'Today' : 'Сегодня'
  if (isoDate === tomorrow) return isEn ? 'Tomorrow' : 'Завтра'

  try {
    const d = parseIsoDate(isoDate)
    return new Intl.DateTimeFormat(norm, {
      day: 'numeric',
      month: 'short',
    }).format(d)
  } catch {
    return isoDate
  }
}

/**
 * Formats month and year for calendar navigation:
 * RU: "Сентябрь 2026"
 * EN: "September 2026"
 */
export function formatMonthYear(date: Date, locale?: string): string {
  const norm = normalizeLocale(locale)
  const formatted = new Intl.DateTimeFormat(norm, {
    month: 'long',
    year: 'numeric',
  }).format(date)

  // Remove " г." in Russian if present
  const cleaned = norm === 'ru-RU' ? formatted.replace(/\s*г\.?$/, '') : formatted
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

/**
 * Formats distance with locale-native number formatting and unit:
 * RU: "390 м", "1,4 км"
 * EN: "390 m", "1.4 km"
 */
export function formatDistance(meters: number, locale?: string): string {
  const norm = normalizeLocale(locale)
  const isEn = norm === 'en-US'

  if (meters < 1000) {
    const rounded = Math.round(meters / 10) * 10 || 50
    const formattedNum = new Intl.NumberFormat(norm).format(rounded)
    return `${formattedNum} ${isEn ? 'm' : 'м'}`
  }

  const km = meters / 1000
  const formattedKm = new Intl.NumberFormat(norm, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(km)

  return `${formattedKm} ${isEn ? 'km' : 'км'}`
}

/**
 * Formats price in RUB preserving the currency symbol ₽:
 * RU: "450 ₽", "1 200 ₽"
 * EN: "450 ₽", "1,200 ₽"
 */
export function formatPrice(price: number, locale?: string): string {
  const norm = normalizeLocale(locale)
  const formatted = new Intl.NumberFormat(norm).format(price)
  return `${formatted} ₽`
}

/**
 * Formats request submission date:
 * RU: "5 октября 2026"
 * EN: "October 5, 2026"
 */
export function formatSubmissionDate(isoString: string, locale?: string): string {
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    const norm = normalizeLocale(locale)
    return new Intl.DateTimeFormat(norm, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d)
  } catch {
    return isoString
  }
}
