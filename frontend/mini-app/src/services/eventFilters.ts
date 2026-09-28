import type { MapEvent, MapFilterState } from '../types'
import { getIsoDate } from '../utils/dateUtils'
import {
  isEventVisibleForDay,
  isEventVisibleForRange,
  isEventActiveAt,
  isEventFinishedAt,
} from '../utils/eventTime'
import { buildLocalDateTime } from '../utils/formatters'

export const DEFAULT_FILTERS: MapFilterState = {
  quickChip: 'all',
  category: 'all',
  dateFilter: 'today',
  selectedDate: getIsoDate(0),
  isFreeOnly: false,
  maxPrice: null,
  pushkinCardOnly: false,
  volunteerOnly: false,
  minAttendees: 0,
  source: 'all',
  timeSlotMinutes: null,
}

/**
 * Converts "HH:MM" to minutes from 00:00
 */
export function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':')
  if (parts.length < 2) return 0
  const hours = parseInt(parts[0], 10) || 0
  const minutes = parseInt(parts[1], 10) || 0
  return hours * 60 + minutes
}

/**
 * Shared filter domain logic for Map and Catalog.
 */
export function filterEvents(
  events: MapEvent[],
  filters?: Partial<MapFilterState>
): MapEvent[] {
  if (!filters) return events

  let filtered = [...events]
  const todayIso = getIsoDate(0)

  // 1. Date filter: intersection with day or weekend range
  if (filters.dateFilter === 'weekend') {
    const d = new Date()
    const dayOfWeek = d.getDay()
    const daysToSat = (6 - dayOfWeek + 7) % 7
    const satIso = getIsoDate(daysToSat)
    const sunIso = getIsoDate(daysToSat + 1)
    filtered = filtered.filter((e) => isEventVisibleForRange(e, satIso, sunIso))
  } else if (filters.selectedDate && filters.selectedDate !== 'all') {
    filtered = filtered.filter((e) => isEventVisibleForDay(e, filters.selectedDate!))
  }

  // 2. Time slot filter (when explicitly supplied) or default today filter
  if (filters.timeSlotMinutes !== undefined && filters.timeSlotMinutes !== null) {
    const targetDate =
      filters.selectedDate && filters.selectedDate !== 'all'
        ? filters.selectedDate
        : todayIso
    const h = Math.floor(filters.timeSlotMinutes / 60)
    const m = filters.timeSlotMinutes % 60
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    const targetDateTime = buildLocalDateTime(targetDate, timeStr)
    if (targetDateTime) {
      filtered = filtered.filter((e) => isEventActiveAt(e, targetDateTime))
    }
  } else if (filters.selectedDate === todayIso) {
    // In default "today" mode without explicit scrubber time: hide already finished events
    const now = new Date()
    filtered = filtered.filter((e) => !isEventFinishedAt(e, now))
  }

  // 2. Quick chips
  if (filters.quickChip && filters.quickChip !== 'all') {
    switch (filters.quickChip) {
      case 'free':
        filtered = filtered.filter((e) => e.isFree || e.price === 0)
        break
      case 'pushkin':
        filtered = filtered.filter((e) => e.pushkinCard)
        break
      case 'under500':
        filtered = filtered.filter((e) => e.price <= 500)
        break
      case 'volunteer':
        filtered = filtered.filter((e) => e.category === 'volunteer')
        break
      default:
        break
    }
  }

  // 3. Category
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter((e) => e.category === filters.category)
  }

  // 4. Free only
  if (filters.isFreeOnly) {
    filtered = filtered.filter((e) => e.isFree || e.price === 0)
  }

  // 5. Max price
  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    filtered = filtered.filter((e) => e.price <= (filters.maxPrice ?? 10000))
  }

  // 6. Pushkin card only
  if (filters.pushkinCardOnly) {
    filtered = filtered.filter((e) => e.pushkinCard)
  }

  // 7. Volunteers only
  if (filters.volunteerOnly) {
    filtered = filtered.filter((e) => e.category === 'volunteer')
  }

  // 8. Source
  if (filters.source && filters.source !== 'all') {
    filtered = filtered.filter((e) => e.source === filters.source)
  }

  // 9. Min attendees
  if (filters.minAttendees && filters.minAttendees > 0) {
    filtered = filtered.filter((e) => e.attendeesCount >= (filters.minAttendees || 0))
  }

  return filtered
}

/**
 * Counts active extra filters for the badge on the «Фильтры» button.
 */
export function countExtraFilters(filters: MapFilterState): number {
  let count = 0
  if (filters.category !== 'all') count++
  if (filters.maxPrice !== null) count++
  if (filters.pushkinCardOnly) count++
  if (filters.volunteerOnly) count++
  if (filters.source !== 'all') count++
  if (filters.minAttendees > 0) count++
  return count
}
