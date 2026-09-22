import type { QuickActionItem, CompactActionItem, EventItem } from '../types'

export const HERO_DATA = {
  title: 'Куда пойти рядом',
  subtitle: 'по интересам и где вы сейчас',
  imageUrl: '/home-kazan-hero.jpg',
  alt: 'Казанский Кремль и мечеть Кул-Шариф',
}

export const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'catalog',
    title: 'Каталог',
    subtitle: 'Места, события,\nактивности',
    icon: 'grid',
    theme: 'purple',
  },
  {
    id: 'tonight',
    title: 'Сегодня\nвечером',
    subtitle: 'Интересное\nрядом с вами',
    icon: 'calendar',
    theme: 'orange',
  },
]

export const COMPACT_ACTIONS: CompactActionItem[] = [
  {
    id: 'pushkinskaya',
    title: 'Пушкинская',
    subtitle: 'Что рядом на улице',
    icon: 'location',
    theme: 'green',
  },
  {
    id: 'volunteers',
    title: 'Волонтёры',
    subtitle: 'Добрые дела рядом',
    icon: 'heart',
    theme: 'pink',
  },
]

export const FEATURED_EVENT: EventItem = {
  id: 'event-embankment',
  title: 'Вечер на набережной',
  date: 'сегодня 19:00',
  price: 'бесплатно',
  imageUrl: '/event-embankment.jpg',
}
