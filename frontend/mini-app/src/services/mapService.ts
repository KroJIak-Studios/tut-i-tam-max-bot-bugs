import type { MapEvent, MapZone, MapFilterState, EventCategory } from '../types'
import { INITIAL_MAP_EVENTS, MAP_ZONES } from '../mocks/mapData'
import { getIsoDate } from '../utils/dateUtils'

const STORAGE_KEY_USER_EVENTS = 'tut_i_tam_user_events'
const STORAGE_KEY_ATTENDANCE = 'tut_i_tam_event_attendance'

function loadUserEvents(): MapEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_EVENTS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveUserEvents(events: MapEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER_EVENTS, JSON.stringify(events))
  } catch {
    // ignore
  }
}

export const DEFAULT_INITIAL_ATTENDANCE: Record<string, boolean> = {
  'event-naberezhnaya': true,
  'event-yoga-park': true,
  'event-volunteer-kazanka': true,
}

export function loadAttendanceMap(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ATTENDANCE)
    if (raw === null) {
      saveAttendanceMap(DEFAULT_INITIAL_ATTENDANCE)
      return { ...DEFAULT_INITIAL_ATTENDANCE }
    }
    return JSON.parse(raw)
  } catch {
    return { ...DEFAULT_INITIAL_ATTENDANCE }
  }
}

export function getAttendanceMap(): Record<string, boolean> {
  return loadAttendanceMap()
}

export function saveAttendanceMap(map: Record<string, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(map))
  } catch {
    // ignore
  }
}

// Convert "HH:MM" to minutes from 00:00
export function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':')
  if (parts.length < 2) return 0
  const hours = parseInt(parts[0], 10) || 0
  const minutes = parseInt(parts[1], 10) || 0
  return hours * 60 + minutes
}

export async function getMapZones(): Promise<MapZone[]> {
  // Simulate lightweight async response
  await new Promise((resolve) => setTimeout(resolve, 60))
  return MAP_ZONES
}

export async function getMapEvents(filters?: Partial<MapFilterState>): Promise<MapEvent[]> {
  await new Promise((resolve) => setTimeout(resolve, 120))

  const userEvents = loadUserEvents()
  const attendance = loadAttendanceMap()

  let allEvents = [...INITIAL_MAP_EVENTS, ...userEvents].map((evt) => {
    const isGoing = attendance[evt.id] ?? evt.isGoing ?? false
    const base = evt.source === 'user' ? {
      ...evt,
      price: 0,
      isFree: true,
      pushkinCard: false,
    } : evt
    return {
      ...base,
      isGoing,
      attendeesCount: base.attendeesCount + (isGoing && !base.isGoing ? 1 : 0),
    }
  })

  if (!filters) {
    return allEvents
  }

  // Date filtering by selectedDate (default today)
  const targetDate = filters.selectedDate || getIsoDate(0)
  const todayIso = getIsoDate(0)

  allEvents = allEvents.filter((e) => {
    if (targetDate === todayIso) {
      return e.date === 'сегодня' || e.date === todayIso
    }
    return e.date === targetDate
  })

  // Quick chips filtering
  if (filters.quickChip) {
    switch (filters.quickChip) {
      case 'free':
        allEvents = allEvents.filter((e) => e.isFree || e.price === 0)
        break
      case 'pushkin':
        allEvents = allEvents.filter((e) => e.pushkinCard)
        break
      case 'under500':
        allEvents = allEvents.filter((e) => e.price <= 500)
        break
      case 'volunteer':
        allEvents = allEvents.filter((e) => e.category === 'volunteer')
        break
      default:
        break
    }
  }

  // Advanced sheet filters
  if (filters.category && filters.category !== 'all') {
    allEvents = allEvents.filter((e) => e.category === filters.category)
  }

  if (filters.isFreeOnly) {
    allEvents = allEvents.filter((e) => e.isFree || e.price === 0)
  }

  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    allEvents = allEvents.filter((e) => e.price <= (filters.maxPrice ?? 10000))
  }

  if (filters.pushkinCardOnly) {
    allEvents = allEvents.filter((e) => e.pushkinCard)
  }

  if (filters.volunteerOnly) {
    allEvents = allEvents.filter((e) => e.category === 'volunteer')
  }

  if (filters.source && filters.source !== 'all') {
    allEvents = allEvents.filter((e) => e.source === filters.source)
  }

  if (filters.minAttendees && filters.minAttendees > 0) {
    allEvents = allEvents.filter((e) => e.attendeesCount >= (filters.minAttendees || 0))
  }

  // Time slider filter: show events scheduled at or after the selected minutes
  if (filters.timeSlotMinutes !== undefined && filters.timeSlotMinutes !== null) {
    allEvents = allEvents.filter((e) => {
      const eventStartMinutes = parseTimeToMinutes(e.startTime)
      const eventEndMinutes = e.endTime ? parseTimeToMinutes(e.endTime) : eventStartMinutes + 120
      // Show events that are active at or start after timeSlot
      return eventEndMinutes >= (filters.timeSlotMinutes ?? 0)
    })
  }

  return allEvents
}

export async function toggleEventAttendance(eventId: string): Promise<MapEvent> {
  await new Promise((resolve) => setTimeout(resolve, 80))

  const attendance = loadAttendanceMap()
  const currentStatus = !!attendance[eventId]
  const newStatus = !currentStatus
  attendance[eventId] = newStatus
  saveAttendanceMap(attendance)

  const events = await getMapEvents()
  const event = events.find((e) => e.id === eventId)
  if (!event) {
    throw new Error(`Event ${eventId} not found`)
  }

  return event
}

export async function setEventAttendance(eventId: string, going: boolean): Promise<MapEvent> {
  await new Promise((resolve) => setTimeout(resolve, 60))

  const attendance = loadAttendanceMap()
  attendance[eventId] = going
  saveAttendanceMap(attendance)

  const events = await getMapEvents()
  const event = events.find((e) => e.id === eventId)
  if (!event) {
    throw new Error(`Event ${eventId} not found`)
  }

  return event
}

export interface NewUserMarkerInput {
  title: string
  category: EventCategory
  startTime: string
  latitude: number
  longitude: number
  description?: string
  address?: string
}

export async function addUserMarker(input: NewUserMarkerInput): Promise<MapEvent> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const newEvent: MapEvent = {
    id: `user-event-${Date.now()}`,
    title: input.title.trim(),
    description: input.description?.trim() || 'Пользовательская активность в Казани',
    latitude: input.latitude,
    longitude: input.longitude,
    category: input.category,
    date: getIsoDate(0),
    startTime: input.startTime || '19:00',
    price: 0,
    isFree: true,
    pushkinCard: false,
    attendeesCount: 1,
    isGoing: true,
    source: 'user',
    address: input.address?.trim() || 'Точка на карте Казани',
  }

  const existing = loadUserEvents()
  const updated = [newEvent, ...existing]
  saveUserEvents(updated)

  // mark attendance for creator
  const attendance = loadAttendanceMap()
  attendance[newEvent.id] = true
  saveAttendanceMap(attendance)

  return newEvent
}
