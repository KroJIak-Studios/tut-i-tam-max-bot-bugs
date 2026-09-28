import type { MapEvent } from '../types'
import { getIsoDate, parseIsoDate } from './dateUtils'
import {
  buildLocalDateTime,
  formatTime,
  calculateDefaultEndDateTime,
  formatEventDateTimeRange as formatRangeRaw,
} from './formatters'

/**
 * Returns event start date as YYYY-MM-DD
 */
export function getEventStartDate(event: Pick<MapEvent, 'startDate' | 'date'>): string {
  return event.startDate || event.date || getIsoDate(0)
}

/**
 * Returns event end date as YYYY-MM-DD.
 * If not set, falls back to calculateDefaultEndDateTime (start + 2h) or startDate.
 */
export function getEventEndDate(
  event: Pick<MapEvent, 'startDate' | 'date' | 'endDate' | 'startTime' | 'endTime'>
): string {
  if (event.endDate) return event.endDate
  const startDate = getEventStartDate(event)
  if (!event.endTime && event.startTime) {
    const def = calculateDefaultEndDateTime(startDate, event.startTime)
    return def.endDate
  }
  return startDate
}

/**
 * Returns event start time as HH:MM
 */
export function getEventStartTime(event: Pick<MapEvent, 'startTime'>): string {
  return event.startTime || '00:00'
}

/**
 * Returns event end time as HH:MM.
 * If not set, defaults to start + 2 hours.
 */
export function getEventEndTime(
  event: Pick<MapEvent, 'startDate' | 'date' | 'startTime' | 'endTime'>
): string {
  if (event.endTime) return event.endTime
  const startDate = getEventStartDate(event)
  const startTime = getEventStartTime(event)
  const def = calculateDefaultEndDateTime(startDate, startTime)
  return def.endTime || '23:59'
}

/**
 * Parses event start as local Date
 */
export function getEventStart(
  event: Pick<MapEvent, 'startDate' | 'date' | 'startTime'>
): Date {
  const startDate = getEventStartDate(event)
  const startTime = getEventStartTime(event)
  const parsed = buildLocalDateTime(startDate, startTime)
  if (parsed) return parsed
  return parseIsoDate(startDate)
}

/**
 * Parses event end as local Date
 */
export function getEventEnd(
  event: Pick<MapEvent, 'startDate' | 'date' | 'endDate' | 'startTime' | 'endTime'>
): Date {
  const endDate = getEventEndDate(event)
  const endTime = getEventEndTime(event)
  const parsed = buildLocalDateTime(endDate, endTime)
  if (parsed) return parsed
  const d = parseIsoDate(endDate)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Checks if event is active at a given datetime:
 * start <= target <= end
 */
export function isEventActiveAt(
  event: Pick<MapEvent, 'startDate' | 'date' | 'endDate' | 'startTime' | 'endTime'>,
  target: Date
): boolean {
  const start = getEventStart(event)
  const end = getEventEnd(event)
  const t = target.getTime()
  return start.getTime() <= t && t <= end.getTime()
}

/**
 * Checks if event starts within `windowMinutes` after target:
 * target < start <= target + windowMinutes
 */
export function isEventUpcomingAt(
  event: Pick<MapEvent, 'startDate' | 'date' | 'startTime'>,
  target: Date,
  windowMinutes: number = 60
): boolean {
  const start = getEventStart(event)
  const t = target.getTime()
  const s = start.getTime()
  return s > t && s - t <= windowMinutes * 60 * 1000
}

/**
 * Checks if event has already finished strictly before target:
 * end < target
 */
export function isEventFinishedAt(
  event: Pick<MapEvent, 'startDate' | 'date' | 'endDate' | 'startTime' | 'endTime'>,
  target: Date
): boolean {
  const end = getEventEnd(event)
  return end.getTime() < target.getTime()
}

/**
 * Checks if event intersects a calendar day [dayIso 00:00:00, dayIso 23:59:59.999]
 */
export function isEventVisibleForDay(
  event: Pick<MapEvent, 'startDate' | 'date' | 'endDate' | 'startTime' | 'endTime'>,
  dayIso: string
): boolean {
  const start = getEventStart(event)
  const end = getEventEnd(event)

  const dayStart = buildLocalDateTime(dayIso, '00:00')
  if (!dayStart) return false
  const dayEnd = new Date(dayStart)
  dayEnd.setHours(23, 59, 59, 999)

  return start.getTime() <= dayEnd.getTime() && end.getTime() >= dayStart.getTime()
}

/**
 * Checks if event intersects a date range [startIso 00:00, endIso 23:59:59]
 */
export function isEventVisibleForRange(
  event: Pick<MapEvent, 'startDate' | 'date' | 'endDate' | 'startTime' | 'endTime'>,
  rangeStartIso: string,
  rangeEndIso: string
): boolean {
  const start = getEventStart(event)
  const end = getEventEnd(event)

  const rStart = buildLocalDateTime(rangeStartIso, '00:00')
  const rEndBase = buildLocalDateTime(rangeEndIso, '23:59')
  if (!rStart || !rEndBase) return false
  const rEnd = new Date(rEndBase)
  rEnd.setSeconds(59, 999)

  return start.getTime() <= rEnd.getTime() && end.getTime() >= rStart.getTime()
}

/**
 * Formats time range "19:00–21:00" / "7:00 PM–9:00 PM"
 */
export function formatEventTimeRange(
  event: Pick<MapEvent, 'startDate' | 'date' | 'endDate' | 'startTime' | 'endTime'>,
  locale?: string
): string {
  const startTime = getEventStartTime(event)
  const endTime = getEventEndTime(event)
  const startFormatted = formatTime(startTime, locale)
  const endFormatted = formatTime(endTime, locale)
  return `${startFormatted}–${endFormatted}`
}

/**
 * Formats full event date and time range for an event object
 */
export function formatEventDateTimeRange(
  event: Pick<MapEvent, 'startDate' | 'date' | 'endDate' | 'startTime' | 'endTime'>,
  locale?: string
): string {
  return formatRangeRaw(event, locale)
}
