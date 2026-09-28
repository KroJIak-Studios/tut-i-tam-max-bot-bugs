import type { MapEvent, EventCategory, EventReview } from '../types'
import { apiRequest } from './api'

export interface DetailedEvent extends MapEvent {
  images: string[]
  reviews: EventReview[]
  isPast: boolean
  visitedDate?: string
}

interface ApiEvent {
  id: string | number
  title: string
  description?: string
  latitude: number
  longitude: number
  category?: string
  address?: string
  starts_at: string
  ends_at?: string
  origin?: 'official' | 'user'
  price_rub?: number | null
  pushkin_card?: boolean | null
  attendees_count?: number
  images?: string[]
  reviews?: EventReview[]
}

function mapDetail(item: ApiEvent): DetailedEvent {
  const start = new Date(item.starts_at)
  const end = item.ends_at ? new Date(item.ends_at) : undefined
  const user = item.origin === 'user'
  const price = user || item.price_rub == null ? 0 : item.price_rub
  return {
    id: String(item.id),
    title: item.title,
    description: item.description || '',
    latitude: item.latitude,
    longitude: item.longitude,
    category: (item.category === 'sport' ? 'sports' : item.category || 'events') as EventCategory,
    date: item.starts_at.slice(0, 10),
    startDate: item.starts_at.slice(0, 10),
    endDate: item.ends_at?.slice(0, 10),
    startTime: start.toTimeString().slice(0, 5),
    endTime: end?.toTimeString().slice(0, 5),
    price,
    isFree: user || price === 0,
    pushkinCard: user ? false : Boolean(item.pushkin_card),
    attendeesCount: item.attendees_count ?? 0,
    source: user ? 'user' : 'external',
    images: item.images?.length ? item.images : ['/event-embankment.jpg'],
    address: item.address || '',
    reviews: item.reviews || [],
    isPast: new Date(item.starts_at) < new Date(),
  }
}

export async function getEventById(id: string): Promise<DetailedEvent> { return mapDetail(await apiRequest<ApiEvent>(`/events/${id}`)) }
export async function submitEventReview(id: string, rating: number, text: string): Promise<void> {
  await apiRequest(`/events/${id}/reviews`, { method: 'POST', body: JSON.stringify({ rating, text, anonymous: false }) })
}
export function findEventById(_rawId: string): DetailedEvent | null { return null }
export type { MapEvent }
