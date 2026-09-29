/**
 * Unified locale-aware formatters layer for Mini-App
 * Provides consistent formatting for dates, times, distances, and prices using Intl API.
 */
import { getIsoDate, parseIsoDate } from './dateUtils'

export type SupportedLocale = 'ru-ru' | 'en-us'

function normalizeLocale(locale?: string): SupportedLocale {
  if (locale && locale.startsWith('en')) {
    return 'en-us'
  }
  return 'ru-ru'
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
  if (norm === 'ru-ru') {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const d = new Date(2026, 0, 1, h, m)
  return new Intl.DateTimeFormat(norm, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

/**
 * Safely parses date and time into local Date object without timezone skew.
 */
export function buildLocalDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !timeStr) return null
  const dateParts = dateStr.trim().split('-')
  const timeParts = timeStr.trim().split(':')
  if (dateParts.length < 3 || timeParts.length < 2) return null
  const y = parseInt(dateParts[0], 10)
  const m = parseInt(dateParts[1], 10)
  const d = parseInt(dateParts[2], 10)
  const h = parseInt(timeParts[0], 10)
  const min = parseInt(timeParts[1], 10)
  if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(h) || isNaN(min)) return null
  return new Date(y, m - 1, d, h, min, 0, 0)
}

/**
 * Checks if end datetime is strictly later than start datetime:
 * - If startDate === endDate and endTime <= startTime -> false
 * - If endDate > startDate -> true (even if endTime <= startTime)
 * - If endDate < startDate -> false
 */
export function isEndDateTimeAfterStart(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
): boolean {
  if (!startDate || !startTime || !endDate || !endTime) return false
  const start = buildLocalDateTime(startDate, startTime)
  const end = buildLocalDateTime(endDate, endTime)
  if (!start || !end) return false
  return end.getTime() > start.getTime()
}

/**
 * Calculates default end date and time (start + 2 hours).
 * If crossing midnight, endDate advances to next day.
 */
export function calculateDefaultEndDateTime(
  startDate: string,
  startTime: string
): { endDate: string; endTime: string } {
  if (!startDate) {
    return { endDate: '', endTime: '' }
  }
  if (!startTime) {
    return { endDate: startDate, endTime: '' }
  }

  const timeParts = startTime.trim().split(':')
  if (timeParts.length < 2) {
    return { endDate: startDate, endTime: '' }
  }
  const h = parseInt(timeParts[0], 10)
  const m = parseInt(timeParts[1], 10)
  if (isNaN(h) || isNaN(m)) {
    return { endDate: startDate, endTime: '' }
  }

  const endH = h + 2
  if (endH >= 24) {
    // Crosses midnight: advance date by 1 day
    const dateParts = startDate.trim().split('-')
    if (dateParts.length === 3) {
      const y = parseInt(dateParts[0], 10)
      const mon = parseInt(dateParts[1], 10)
      const d = parseInt(dateParts[2], 10)
      const nextDate = new Date(y, mon - 1, d + 1)
      const nextY = nextDate.getFullYear()
      const nextM = String(nextDate.getMonth() + 1).padStart(2, '0')
      const nextD = String(nextDate.getDate()).padStart(2, '0')
      const nextEndDate = `${nextY}-${nextM}-${nextD}`
      const nextEndTime = `${String(endH - 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      return { endDate: nextEndDate, endTime: nextEndTime }
    }
  }

  return {
    endDate: startDate,
    endTime: `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
  }
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
  const isEn = norm === 'en-us'
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
/**
 * Formats event date and time range for same-day and multi-day events.
 *
 * Same-day:
 *   RU: "5 октября · 14:00–16:00"
 *   EN: "October 5 · 2:00 PM–4:00 PM"
 *
 * Multi-day:
 *   RU: "5 октября 23:00 — 6 октября 01:00"
 *   EN: "October 5, 11:00 PM — October 6, 1:00 AM"
 */
export function formatEventDateTimeRange(
  eventOrStartDate:
    | {
        startDate?: string
        date?: string
        startTime?: string
        endDate?: string
        endTime?: string
      }
    | string,
  startTimeOrLocale?: string,
  endDateOrEndTime?: string,
  endTimeOrLocale?: string,
  possibleLocale?: string
): string {
  if (!eventOrStartDate) return '—'

  let startDate = ''
  let startTime: string | undefined = undefined
  let endDate = ''
  let endTime: string | undefined = undefined
  let locale: string | undefined = undefined

  if (typeof eventOrStartDate === 'object') {
    startDate = eventOrStartDate.startDate || eventOrStartDate.date || ''
    startTime = eventOrStartDate.startTime
    endDate = eventOrStartDate.endDate || startDate
    endTime = eventOrStartDate.endTime
    locale = startTimeOrLocale
  } else {
    startDate = eventOrStartDate
    startTime = startTimeOrLocale

    // Backward compatibility check for 4-argument call (startDate, startTime, endTime, locale)
    if (
      endDateOrEndTime &&
      /^\d{1,2}:\d{2}$/.test(endDateOrEndTime) &&
      (!possibleLocale || possibleLocale === undefined)
    ) {
      endDate = startDate
      endTime = endDateOrEndTime
      locale = endTimeOrLocale
    } else {
      endDate = endDateOrEndTime || startDate
      endTime = endTimeOrLocale
      locale = possibleLocale
    }
  }

  if (!startDate) return '—'
  if (!endDate) endDate = startDate

  const norm = normalizeLocale(locale)
  const isEn = norm === 'en-us'
  const isSameDay = startDate === endDate

  if (isSameDay) {
    if (!startTime) {
      return formatEventDateTime(startDate, undefined, norm)
    }
    const formattedStart = formatTime(startTime, norm)
    if (!endTime) {
      return formatEventDateTime(startDate, startTime, norm)
    }
    const formattedEnd = formatTime(endTime, norm)
    const timeRange = `${formattedStart}–${formattedEnd}`
    const datePrefix = formatEventDateTime(startDate, undefined, norm)
    return `${datePrefix} · ${timeRange}`
  }

  // Multi-day without specific times: e.g. "10–12 октября" or "Oct 10–12"
  if (!startTime && !endTime) {
    const sParts = startDate.split('-').map(Number)
    const eParts = endDate.split('-').map(Number)
    if (sParts.length === 3 && eParts.length === 3) {
      const [sY, sM, sD] = sParts
      const [eY, eM, eD] = eParts
      if (sY === eY && sM === eM) {
        // Same month
        const dObj = new Date(sY, sM - 1, sD)
        const monthShort = new Intl.DateTimeFormat(norm, { month: 'short' }).format(dObj)
        const monthLong = new Intl.DateTimeFormat(norm, { month: 'long' }).format(dObj)
        if (isEn) {
          return `${monthShort} ${sD}–${eD}`
        }
        return `${sD}–${eD} ${monthLong}`
      }
    }
  }

  // Multi-day with times
  const startDatePart = formatEventDateTime(startDate, undefined, norm)
  const endDatePart = formatEventDateTime(endDate, undefined, norm)
  const formattedStart = startTime ? formatTime(startTime, norm) : ''
  const formattedEnd = endTime ? formatTime(endTime, norm) : ''

  if (isEn) {
    const startStr = formattedStart ? `${startDatePart}, ${formattedStart}` : startDatePart
    const endStr = formattedEnd ? `${endDatePart}, ${formattedEnd}` : endDatePart
    return `${startStr} — ${endStr}`
  }

  const startStr = formattedStart ? `${startDatePart} ${formattedStart}` : startDatePart
  const endStr = formattedEnd ? `${endDatePart} ${formattedEnd}` : endDatePart
  return `${startStr} — ${endStr}`
}

/**
 * Formats chip date (e.g. for filter bar):
 * RU: "Сегодня", "Завтра", "27 сент."
 * EN: "Today", "Tomorrow", "Sep 27"
 */
export function formatChipDate(isoDate: string, locale?: string): string {
  const norm = normalizeLocale(locale)
  const isEn = norm === 'en-us'
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
  const cleaned = norm === 'ru-ru' ? formatted.replace(/\s*г\.?$/, '') : formatted
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

/**
 * Formats distance with locale-native number formatting and unit:
 * RU: "390 м", "1,4 км"
 * EN: "390 m", "1.4 km"
 */
export function formatDistance(meters: number, locale?: string): string {
  const norm = normalizeLocale(locale)
  const isEn = norm === 'en-us'

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
