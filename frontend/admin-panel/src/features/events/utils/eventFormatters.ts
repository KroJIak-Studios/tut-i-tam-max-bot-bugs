import { runtimeConfig, DEFAULT_FALLBACK_LOCALE } from '../../../config/runtimeConfig'
import type { AdminEventImage, AdminEventItem, AdminEventOrigin, AdminEventPhase } from '../types'
import type { City } from '../../cities/types/city'
import type { EventCategory } from '../../categories/types'

const MONTHS_SHORT_RU = [
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
]

export function formatEventDateTime(startsAtIso: string, endsAtIso?: string | null): string {
  if (!startsAtIso) return '—'

  try {
    const start = new Date(startsAtIso)
    if (isNaN(start.getTime())) return startsAtIso

    const day = start.getDate()
    const month = MONTHS_SHORT_RU[start.getMonth()] || ''
    const year = start.getFullYear()
    const startHours = String(start.getHours()).padStart(2, '0')
    const startMins = String(start.getMinutes()).padStart(2, '0')
    const startTimeStr = `${startHours}:${startMins}`

    if (!endsAtIso) {
      return `${day} ${month} ${year}, ${startTimeStr}`
    }

    const end = new Date(endsAtIso)
    if (isNaN(end.getTime())) {
      return `${day} ${month} ${year}, ${startTimeStr}`
    }

    const endHours = String(end.getHours()).padStart(2, '0')
    const endMins = String(end.getMinutes()).padStart(2, '0')
    const endTimeStr = `${endHours}:${endMins}`

    const isSameDay =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate()

    if (isSameDay) {
      return `${day} ${month} ${year}, ${startTimeStr} – ${endTimeStr}`
    }

    const endDay = end.getDate()
    const endMonth = MONTHS_SHORT_RU[end.getMonth()] || ''
    const endYear = end.getFullYear()

    return `${day} ${month} ${year}, ${startTimeStr} — ${endDay} ${endMonth} ${endYear}, ${endTimeStr}`
  } catch {
    return startsAtIso
  }
}

export function getPhaseBadge(phase: AdminEventPhase): { label: string; variant: 'scheduled' | 'ongoing' | 'finished' } {
  switch (phase) {
    case 'ongoing':
      return { label: 'Идёт сейчас', variant: 'ongoing' }
    case 'scheduled':
      return { label: 'Запланировано', variant: 'scheduled' }
    case 'finished':
      return { label: 'Завершено', variant: 'finished' }
    default:
      return { label: phase, variant: 'scheduled' }
  }
}

export function getOriginBadge(origin: AdminEventOrigin): { label: string; variant: 'official' | 'user' } {
  switch (origin) {
    case 'official':
      return { label: 'Официальное', variant: 'official' }
    case 'user':
      return { label: 'Пользовательское', variant: 'user' }
    default:
      return { label: origin, variant: 'official' }
  }
}

export function getVisibilityBadge(visible: boolean): { label: string; variant: 'visible' | 'hidden' } {
  return visible
    ? { label: 'Видно', variant: 'visible' }
    : { label: 'Скрыто', variant: 'hidden' }
}

export function formatEventPrice(event: Pick<AdminEventItem, 'origin' | 'price_rub'>): string {
  if (event.origin === 'user') {
    return 'Бесплатно'
  }
  if (event.price_rub === 0 || event.price_rub === null) {
    return 'Бесплатно'
  }
  return `${event.price_rub.toLocaleString('ru-RU')} ₽`
}

export function resolveCityName(cityId: number, cities: City[]): string {
  const city = cities.find((c) => c.id === cityId)
  if (!city) return `Город #${cityId}`

  const targetLocale = runtimeConfig.fallbackLocale || DEFAULT_FALLBACK_LOCALE
  const found = city.names.find((n) => n.locale_code === targetLocale)
  if (found && found.text) return found.text

  return city.names[0]?.text || `Город #${cityId}`
}

export function resolveCategoryName(
  categoryId: number | null,
  categories: EventCategory[],
): string {
  if (categoryId === null) return 'Без категории'

  const cat = categories.find((c) => c.id === categoryId)
  if (!cat) return `Категория #${categoryId}`

  const targetLocale = runtimeConfig.fallbackLocale || DEFAULT_FALLBACK_LOCALE
  const found = cat.names.find((n) => n.locale_code === targetLocale)
  if (found && found.text) return found.text

  return cat.names[0]?.text || `Категория #${categoryId}`
}

export function getFirstImageUrl(images?: (string | AdminEventImage)[] | null): string | null {
  if (!images || images.length === 0) return null
  const first = images[0]
  if (typeof first === 'string') return first
  return first.url || null
}

export function getImageUrls(images?: (string | AdminEventImage)[] | null): string[] {
  if (!images) return []
  return images.map((img) => (typeof img === 'string' ? img : img.url)).filter(Boolean)
}
