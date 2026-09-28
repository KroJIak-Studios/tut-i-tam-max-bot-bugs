import type { AdminRequestStatus, EventCategory } from '../types/request'

export function getStatusLabel(status: AdminRequestStatus): string {
  switch (status) {
    case 'pending':
      return 'На проверке'
    case 'needs_changes':
      return 'Нужны уточнения'
    case 'approved':
      return 'Одобрено'
    case 'rejected':
      return 'Отклонено'
    default:
      return status
  }
}

export function getCategoryLabel(category: EventCategory): string {
  switch (category) {
    case 'events':
      return 'Мероприятия'
    case 'sports':
      return 'Спорт'
    case 'volunteer':
      return 'Волонтёрство'
    case 'parks':
      return 'Парки'
    case 'places':
      return 'Места'
    case 'user':
      return 'Пользовательское'
    default:
      return category
  }
}

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

export function formatDateRu(dateStr: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const year = parts[0]
  const monthIdx = parseInt(parts[1], 10) - 1
  const day = parseInt(parts[2], 10)
  const monthName = MONTHS_SHORT_RU[monthIdx] || parts[1]
  return `${day} ${monthName} ${year}`
}

export function formatDateTimeRange(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
): string {
  if (!startDate) return ''
  const formattedStart = formatDateRu(startDate)
  const timePart =
    startTime && endTime
      ? `${startTime} – ${endTime}`
      : startTime
        ? `с ${startTime}`
        : ''

  if (!endDate || endDate === startDate) {
    return timePart ? `${formattedStart}, ${timePart}` : formattedStart
  }

  const formattedEnd = formatDateRu(endDate)
  return `${formattedStart} ${startTime} – ${formattedEnd} ${endTime}`.trim()
}

export function formatDuration(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
): string {
  if (!startDate || !startTime || !endTime) return ''
  try {
    const endD = endDate || startDate
    const start = new Date(`${startDate}T${startTime}:00`)
    const end = new Date(`${endD}T${endTime}:00`)
    const diffMs = end.getTime() - start.getTime()
    if (diffMs <= 0) return ''

    const totalMinutes = Math.round(diffMs / (1000 * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours > 0 && minutes > 0) {
      return `${hours} ч ${minutes} мин`
    }
    if (hours > 0) {
      return `${hours} ч`
    }
    return `${minutes} мин`
  } catch {
    return ''
  }
}

export function formatSubmissionTime(isoStr: string): string {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return isoStr

    const day = d.getDate()
    const month = MONTHS_SHORT_RU[d.getMonth()]
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')

    return `${day} ${month} ${year}, ${hours}:${minutes}`
  } catch {
    return isoStr
  }
}
