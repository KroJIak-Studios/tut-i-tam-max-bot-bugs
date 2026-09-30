// Compact date utilities for Map and Event date selection

const MONTH_NAMES_SHORT = [
  'янв.', 'фев.', 'мар.', 'апр.', 'мая', 'июн.',
  'июл.', 'авг.', 'сен.', 'окт.', 'нояб.', 'дек.',
]

const MONTH_NAMES_FULL = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

const DAY_OF_WEEK_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

export function getIsoDate(offsetDays: number = 0, baseDate: Date = new Date()): string {
  const d = new Date(baseDate)
  d.setDate(d.getDate() + offsetDays)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatChipDate(isoDate: string, locale: string = 'ru-ru'): string {
  const isEn = locale.startsWith('en')
  const today = getIsoDate(0)
  const tomorrow = getIsoDate(1)

  if (isoDate === today) return isEn ? 'Today' : 'Сегодня'
  if (isoDate === tomorrow) return isEn ? 'Tomorrow' : 'Завтра'

  const dateObj = parseIsoDate(isoDate)
  if (isEn) {
    return new Intl.DateTimeFormat('en-us', { day: 'numeric', month: 'short' }).format(dateObj)
  }
  const dayNum = dateObj.getDate()
  const monthStr = MONTH_NAMES_SHORT[dateObj.getMonth()] || ''
  return `${dayNum} ${monthStr}`
}

export function formatMonthYear(date: Date, locale: string = 'ru-ru'): string {
  const isEn = locale.startsWith('en')
  if (isEn) {
    return new Intl.DateTimeFormat('en-us', { month: 'long', year: 'numeric' }).format(date)
  }
  const monthName = MONTH_NAMES_FULL[date.getMonth()]
  return `${monthName} ${date.getFullYear()}`
}

export function getNextDays(
  count: number = 7,
  locale: string = 'ru-ru'
): Array<{
  iso: string
  dayOfWeek: string
  dayNum: number
  isToday: boolean
}> {
  const isEn = locale.startsWith('en')
  const result = []
  const todayIso = getIsoDate(0)

  for (let i = 0; i < count; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const iso = getIsoDate(i)
    let dayOfWeek = DAY_OF_WEEK_SHORT[d.getDay()]
    if (isEn) {
      const rawWk = new Intl.DateTimeFormat('en-us', { weekday: 'short' }).format(d)
      dayOfWeek = rawWk.charAt(0).toUpperCase() + rawWk.slice(1)
    }
    const dayNum = d.getDate()
    result.push({
      iso,
      dayOfWeek,
      dayNum,
      isToday: iso === todayIso,
    })
  }

  return result
}

export function getWeekendIsoDate(): string {
  const d = new Date()
  const day = d.getDay() // 0 = Sun, 6 = Sat
  if (day === 6) {
    return getIsoDate(0) // It's Saturday today
  }
  if (day === 0) {
    return getIsoDate(0) // It's Sunday today
  }
  const daysUntilSaturday = 6 - day
  return getIsoDate(daysUntilSaturday)
}

export interface CalendarDay {
  iso: string
  dayNum: number
  isCurrentMonth: boolean
  isDisabled: boolean
  isToday: boolean
  isSelected: boolean
}

export function generateMonthCalendar(
  currentMonthDate: Date,
  selectedIso: string,
  minIso: string = getIsoDate(0),
  maxIso: string = getIsoDate(60)
): CalendarDay[] {
  const year = currentMonthDate.getFullYear()
  const month = currentMonthDate.getMonth()

  // First day of this month
  const firstDay = new Date(year, month, 1)
  // Day of week in Monday=0..Sunday=6
  const startDayOfWeek = (firstDay.getDay() + 6) % 7

  // Days in month
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  const todayIso = getIsoDate(0)
  const days: CalendarDay[] = []

  // Preceding days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i
    const prevMonthDate = new Date(year, month - 1, dayNum)
    const iso = getIsoDate(0, prevMonthDate)
    days.push({
      iso,
      dayNum,
      isCurrentMonth: false,
      isDisabled: iso < minIso || iso > maxIso, // out of current month
      isToday: iso === todayIso,
      isSelected: iso === selectedIso,
    })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const thisDate = new Date(year, month, d)
    const iso = getIsoDate(0, thisDate)
    const isPast = iso < minIso
    const isTooFar = iso > maxIso
    days.push({
      iso,
      dayNum: d,
      isCurrentMonth: true,
      isDisabled: isPast || isTooFar,
      isToday: iso === todayIso,
      isSelected: iso === selectedIso,
    })
  }

  // Trailing days to fill standard 35 or 42 grid
  const remaining = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month + 1, i)
    const iso = getIsoDate(0, nextDate)
    days.push({
      iso,
      dayNum: i,
      isCurrentMonth: false,
      isDisabled: iso < minIso || iso > maxIso,
      isToday: iso === todayIso,
      isSelected: iso === selectedIso,
    })
  }

  return days
}

export function formatTime(timeStr?: string, locale: string = 'ru-ru'): string {
  if (!timeStr) return ''
  const parts = timeStr.trim().split(':')
  if (parts.length < 2) return timeStr
  const h = Number(parts[0])
  const m = Number(parts[1])
  if (isNaN(h) || isNaN(m)) return timeStr

  const isEn = locale.startsWith('en')
  const d = new Date(2026, 0, 1, h, m)
  return new Intl.DateTimeFormat(isEn ? 'en-us' : 'ru-ru', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

export function formatEventDateTime(
  dateStr: string,
  startTime?: string,
  locale: string = 'ru-ru'
): string {
  const isEn = locale.startsWith('en')
  const today = getIsoDate(0)
  const tomorrow = getIsoDate(1)
  const formattedTime = startTime ? formatTime(startTime, locale) : ''
  const time = formattedTime ? ` · ${formattedTime}` : ''

  const lower = dateStr.trim().toLowerCase()
  if (lower === 'сегодня' || lower === 'today' || dateStr === today) {
    return `${isEn ? 'Today' : 'Сегодня'}${time}`
  }
  if (lower === 'завтра' || lower === 'tomorrow' || dateStr === tomorrow) {
    return `${isEn ? 'Tomorrow' : 'Завтра'}${time}`
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const d = parseIsoDate(dateStr)
    const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-us' : 'ru-ru', {
      day: 'numeric',
      month: 'long',
    }).format(d)
    return `${formattedDate}${time}`
  }

  return `${dateStr}${time}`
}

export type GreetingKey = 'morning' | 'afternoon' | 'evening'

/**
 * Returns greeting key based on client local time:
 * 05:00–11:59 => morning
 * 12:00–17:59 => afternoon
 * 18:00–04:59 => evening
 */
export function getGreetingKey(date: Date = new Date()): GreetingKey {
  const hours = date.getHours()
  if (hours >= 5 && hours < 12) {
    return 'morning'
  }
  if (hours >= 12 && hours < 18) {
    return 'afternoon'
  }
  return 'evening'
}

/**
 * Returns time-based greeting for client local time (backward compatible):
 * 05:00–11:59 => Доброе утро
 * 12:00–17:59 => Добрый день
 * 18:00–04:59 => Добрый вечер
 */
export function getGreeting(date: Date = new Date()): string {
  const key = getGreetingKey(date)
  if (key === 'morning') return 'Доброе утро'
  if (key === 'afternoon') return 'Добрый день'
  return 'Добрый вечер'
}

/**
 * Correct Russian pluralization for "Найдено N событие / события / событий"
 */
export function formatFoundEventsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100

  let word = 'событий'
  if (mod100 < 11 || mod100 > 19) {
    if (mod10 === 1) {
      word = 'событие'
    } else if (mod10 >= 2 && mod10 <= 4) {
      word = 'события'
    }
  }

  return `Найдено ${count} ${word}`
}
