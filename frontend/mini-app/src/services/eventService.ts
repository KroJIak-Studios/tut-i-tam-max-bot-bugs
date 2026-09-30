import type { MapEvent, EventReview } from '../types'
import { apiRequest, ApiError } from './api'
import { INITIAL_MAP_EVENTS } from '../mocks/mapData'
import { INITIAL_PAST_EVENTS } from '../mocks/plansData'
import { getIsoDate } from '../utils/dateUtils'

export const DEFAULT_EVENT_CHAT_URL = 'https://max.ru/join/sfWhQMWdAzsQZDo47d0e4NubYOl-f5oJFLqKbfQhqPQ'

export interface DetailedEvent extends MapEvent {
  images: string[]
  reviews: EventReview[]
  isPast: boolean
  visitedDate?: string
  owned: boolean
  chatConnected: boolean
  chatInviteUrl: string | null
}

interface ApiEvent {
  id: string | number
  title: string
  description?: string
  latitude: number
  longitude: number
  category_id?: number | null
  address?: string
  starts_at: string
  ends_at?: string
  origin?: 'official' | 'user'
  price_rub?: number | null
  pushkin_card?: boolean | null
  attendees_count?: number
  images?: string[]
  reviews?: EventReview[]
  chat_connected?: boolean
  chat_invite_url?: string | null
  owned?: boolean
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
    category: item.category_id == null ? null : String(item.category_id),
    categoryId: item.category_id ?? null,
    date: getIsoDate(0, start),
    startDate: getIsoDate(0, start),
    endDate: end ? getIsoDate(0, end) : undefined,
    startTime: start.toTimeString().slice(0, 5),
    endTime: end?.toTimeString().slice(0, 5),
    price,
    isFree: user || price === 0,
    pushkinCard: user ? false : Boolean(item.pushkin_card),
    attendeesCount: item.attendees_count ?? 0,
    source: user ? 'user' : 'external',
    images: item.images ?? [],
    address: item.address || '',
    reviews: item.reviews || [],
    isPast: new Date(item.starts_at) < new Date(),
    owned: Boolean(item.owned),
    chatConnected: Boolean(item.chat_connected || item.chat_invite_url || DEFAULT_EVENT_CHAT_URL),
    chatInviteUrl: item.chat_invite_url || DEFAULT_EVENT_CHAT_URL,
  }
}

function findFallbackEvent(rawId: string): DetailedEvent | null {
  if (!rawId) return null
  const target = rawId.toLowerCase().trim()
  const found = INITIAL_MAP_EVENTS.find(
    (e) => e.id.toLowerCase() === target || e.aliasIds?.some((a) => a.toLowerCase() === target)
  )
  if (found) {
    const imgs = (found.images && found.images.length > 0) ? found.images : found.image ? [found.image] : ['/event-embankment.jpg']
    return {
      ...found,
      images: imgs,
      reviews: [],
      isPast: false,
      owned: false,
      chatConnected: true,
      chatInviteUrl: DEFAULT_EVENT_CHAT_URL,
    }
  }
  const foundPast = INITIAL_PAST_EVENTS.find((e) => e.id.toLowerCase() === target)
  if (foundPast) {
    return {
      id: foundPast.id,
      title: foundPast.title,
      description: foundPast.description || '',
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
      images: foundPast.imageUrl ? [foundPast.imageUrl] : ['/event-embankment.jpg'],
      address: foundPast.address || 'Казань',
      reviews: [],
      isPast: true,
      visitedDate: foundPast.visitedDate,
      owned: false,
      chatConnected: true,
      chatInviteUrl: DEFAULT_EVENT_CHAT_URL,
    }
  }
  return null
}

export async function getEventById(id: string): Promise<DetailedEvent> {
  try {
    return mapDetail(await apiRequest<ApiEvent>(`/events/${id}`))
  } catch (err) {
    if (import.meta.env.VITE_ALLOW_MOCK_FALLBACK === 'true' && err instanceof ApiError && err.status === 0) {
      const fallback = findFallbackEvent(id)
      if (fallback) return fallback
    }
    throw err
  }
}

export async function connectEventChat(id: string, chatInviteUrl: string): Promise<void> {
  await apiRequest(`/events/${id}/chat`, { method: 'POST', body: JSON.stringify({ chat_invite_url: chatInviteUrl }) })
}

export async function cancelOwnEvent(id: string): Promise<void> {
  await apiRequest(`/events/${id}`, { method: 'DELETE' })
}

export async function submitEventReview(id: string, rating: number, text: string): Promise<void> {
  await apiRequest(`/events/${id}/reviews`, { method: 'POST', body: JSON.stringify({ rating, text, anonymous: false }) })
}

export function findEventById(rawId: string): DetailedEvent | null {
  if (import.meta.env.VITE_ALLOW_MOCK_FALLBACK !== 'true') return null
  return findFallbackEvent(rawId)
}

export type { MapEvent }
