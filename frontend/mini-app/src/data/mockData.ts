import type { HomeActionItem, QuickActionItem, CompactActionItem, EventItem } from '../types'

export const HERO_DATA = {
  title: 'Куда пойти рядом',
  subtitle: 'по интересам и где вы сейчас',
  imageUrl: '/home-kazan-hero.jpg',
  alt: 'Казанский Кремль и мечеть Кул-Шариф',
}

export const HOME_ACTIONS: HomeActionItem[] = [
  {
    id: 'catalog',
    title: 'Каталог',
    subtitle: 'Все места рядом',
    icon: 'grid',
    theme: 'purple',
  },
  {
    id: 'tonight',
    title: 'Сегодня вечером',
    subtitle: 'События в Казани',
    icon: 'calendar',
    theme: 'orange',
  },
  {
    id: 'pushkinskaya',
    title: 'Пушкинская',
    subtitle: 'Рядом с вами',
    icon: 'location',
    theme: 'green',
  },
  {
    id: 'volunteers',
    title: 'Волонтёры',
    subtitle: 'Делать добро рядом',
    icon: 'heart',
    theme: 'pink',
  },
]

export const QUICK_ACTIONS: QuickActionItem[] = HOME_ACTIONS.slice(0, 2)
export const COMPACT_ACTIONS: CompactActionItem[] = HOME_ACTIONS.slice(2, 4)

export const FEATURED_EVENT: EventItem = {
  id: 'event-naberezhnaya',
  title: 'Вечер на набережной',
  date: 'сегодня · 19:00',
  price: 'Бесплатно',
  imageUrl: '/event-embankment.jpg',
  tag: 'Рекомендуем сегодня',
}
