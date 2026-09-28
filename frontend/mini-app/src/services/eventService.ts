import type { MapEvent, EventCategory, EventReview } from '../types'
import { INITIAL_MAP_EVENTS } from '../mocks/mapData'
import { INITIAL_PAST_EVENTS } from '../mocks/plansData'

export interface DetailedEvent {
  id: string
  title: string
  description: string
  latitude: number
  longitude: number
  category: EventCategory
  date: string
  startDate?: string
  endDate?: string
  startTime: string
  endTime?: string
  price: number
  isFree: boolean
  pushkinCard: boolean
  attendeesCount: number
  source: 'external' | 'user'
  image?: string
  images: string[]
  address: string
  reviews: EventReview[]
  isPast: boolean
  visitedDate?: string
}

const STORAGE_KEY_USER_EVENTS = 'tut_i_tam_user_events'

function loadUserEvents(): MapEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_EVENTS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Fallback images if none defined
const DEFAULT_IMAGE = '/event-embankment.jpg'

export function findEventById(rawId: string): DetailedEvent | null {
  if (!rawId) return null
  const target = rawId.toLowerCase().trim()

  // 1. Search in Map events (initial + user created)
  const userEvents = loadUserEvents()
  const mapEvents = [...INITIAL_MAP_EVENTS, ...userEvents]

  const foundMap = mapEvents.find((e) => {
    if (e.id.toLowerCase() === target) return true
    if (e.aliasIds && e.aliasIds.some((alias) => alias.toLowerCase() === target)) return true
    return false
  })

  if (foundMap) {
    const imgs = (foundMap.images && foundMap.images.length > 0)
      ? foundMap.images
      : foundMap.image
        ? [foundMap.image]
        : [DEFAULT_IMAGE]

    return {
      id: foundMap.id,
      title: foundMap.title,
      description: foundMap.description || 'Увлекательное событие в Казани.',
      latitude: foundMap.latitude,
      longitude: foundMap.longitude,
      category: foundMap.category,
      date: foundMap.date,
      startDate: foundMap.startDate || foundMap.date,
      endDate: foundMap.endDate || foundMap.startDate || foundMap.date,
      startTime: foundMap.startTime,
      endTime: foundMap.endTime,
      price: foundMap.price ?? 0,
      isFree: foundMap.isFree ?? (foundMap.price === 0),
      pushkinCard: !!foundMap.pushkinCard,
      attendeesCount: foundMap.attendeesCount || 0,
      source: foundMap.source,
      image: imgs[0],
      images: imgs,
      address: foundMap.address || 'Казань',
      reviews: foundMap.reviews || [],
      isPast: false,
    }
  }

  // 2. Search in Past events
  const foundPast = INITIAL_PAST_EVENTS.find((e) => e.id.toLowerCase() === target)
  if (foundPast) {
    const imgs = (foundPast.images && foundPast.images.length > 0)
      ? foundPast.images
      : foundPast.imageUrl
        ? [foundPast.imageUrl]
        : [DEFAULT_IMAGE]

    return {
      id: foundPast.id,
      title: foundPast.title,
      description: foundPast.description || 'Прошедшее городское мероприятие в Казани.',
      latitude: foundPast.latitude || 55.7985,
      longitude: foundPast.longitude || 49.1055,
      category: foundPast.category,
      date: foundPast.date,
      startTime: '19:00',
      price: 0,
      isFree: true,
      pushkinCard: false,
      attendeesCount: 15,
      source: 'external',
      image: imgs[0],
      images: imgs,
      address: foundPast.address || 'Казань',
      reviews: [],
      isPast: true,
      visitedDate: foundPast.visitedDate,
    }
  }

  return null
}
