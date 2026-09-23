import type { EventCategory } from '../types'

export interface PastEvent {
  id: string
  title: string
  date: string
  visitedDate: string
  imageUrl?: string
  images?: string[]
  description?: string
  address: string
  category: EventCategory
  latitude?: number
  longitude?: number
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
    images: ['/home-kazan-hero.jpg', '/event-embankment.jpg'],
    description: 'Увлекательная пешеходная экскурсия по древней крепости с историком и гидом. Осмотрели смотровые площадки и узнали легенды Казанского Кремля.',
    address: 'Казанский Кремль, Спасская башня',
    category: 'places',
    latitude: 55.7985,
    longitude: 49.1055,
    hasReview: false,
  },
  {
    id: 'past-architecture',
    title: 'Архитектура старой Казани',
    date: '18 сентября',
    visitedDate: 'Были 18 сентября',
    imageUrl: '/event-embankment.jpg',
    images: ['/event-embankment.jpg'],
    description: 'Лекция и открытая дискуссия о сохранении исторического наследия города, деревянном зодчестве и купеческих особняках.',
    address: 'ул. Бурхана Шахиди, 7',
    category: 'events',
    latitude: 55.7875,
    longitude: 49.1230,
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
    images: ['/event-embankment.jpg'],
    description: 'Уютная вечерняя прогулка у Черного озера под звуки акустической гитары и фонарей.',
    address: 'Парк «Чёрное озеро»',
    category: 'parks',
    latitude: 55.7942,
    longitude: 49.1170,
    hasReview: false,
  },
]
