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
    subtitle: 'Места и активности',
    icon: 'grid',
    theme: 'purple',
  },
  {
    id: 'tonight',
    title: 'Сегодня вечером',
    subtitle: 'Интересное рядом',
    icon: 'calendar',
    theme: 'orange',
  },
]

export const COMPACT_ACTIONS: CompactActionItem[] = [
  {
    id: 'pushkinskaya',
    title: 'Пушкинская',
    subtitle: 'События по карте',
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
  id: 'event-naberezhnaya',
  title: 'Вечер на набережной',
  date: 'сегодня · 19:00',
  price: 'Бесплатно',
  imageUrl: '/event-embankment.jpg',
  tag: 'Рекомендуем сегодня',
}
