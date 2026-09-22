import type { EventCategory } from '../types'

export interface PastEvent {
  id: string
  title: string
  date: string
  visitedDate: string
  imageUrl?: string
  address: string
  category: EventCategory
  hasReview?: boolean
  rating?: number
  reviewComment?: string
}

export const INITIAL_PAST_EVENTS: PastEvent[] = [
  {
    id: 'past-kremlin',
    title: 'Экскурсия по Казанскому Кремлю',
    date: '21 сентября',
    visitedDate: 'Были 21 сентября',
    imageUrl: '/home-kazan-hero.jpg',
    address: 'Казанский Кремль, Спасская башня',
    category: 'places',
    hasReview: false,
  },
  {
    id: 'past-architecture',
    title: 'Архитектура старой Казани',
    date: '18 сентября',
    visitedDate: 'Были 18 сентября',
    imageUrl: '/event-embankment.jpg',
    address: 'ул. Бурхана Шахиди, 7',
    category: 'events',
    hasReview: true,
    rating: 5,
    reviewComment: 'Прекрасный лектор, очень интересно рассказал про купеческие дома.',
  },
  {
    id: 'past-black-lake',
    title: 'Вечерняя прогулка в парке',
    date: '12 сентября',
    visitedDate: 'Были 12 сентября',
    imageUrl: '/event-embankment.jpg',
    address: 'Парк «Чёрное озеро»',
    category: 'parks',
    hasReview: false,
  },
]
