export type NavTabId = 'home' | 'chat' | 'map' | 'plans' | 'profile'

export interface QuickActionItem {
  id: string
  title: string
  subtitle: string
  icon: 'grid' | 'calendar'
  theme: 'purple' | 'orange'
  badge?: string
}

export interface CompactActionItem {
  id: string
  title: string
  subtitle: string
  icon: 'location' | 'heart'
  theme: 'green' | 'pink'
}

export interface EventItem {
  id: string
  title: string
  date: string
  price: string
  imageUrl: string
  tag?: string
}
