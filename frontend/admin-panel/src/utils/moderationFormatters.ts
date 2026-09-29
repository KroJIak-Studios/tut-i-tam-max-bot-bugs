import type { ModerationStatus } from '../features/moderation/types'

/**
 * Map API moderation status to display label.
 * API uses 'changes_requested'; UI displays 'На доработку'.
 */
export function getModerationStatusLabel(status: ModerationStatus): string {
  switch (status) {
    case 'pending':
      return 'На проверке'
    case 'approved':
      return 'Одобрено'
    case 'rejected':
      return 'Отклонено'
    case 'changes_requested':
      return 'На доработку'
    default:
      return status
  }
}

/**
 * Format ISO date string to a relative "time ago" label in Russian.
 */
export function formatTimeAgo(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return '—'
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'только что'
  if (diffMin < 60) return `${diffMin} мин. назад`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH} ч. назад`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD} д. назад`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

/**
 * Format ISO date string to full date+time string in Russian.
 */
export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format date range from two ISO strings.
 */
export function formatDateRange(
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
): string {
  if (!startsAt) return '—'
  const start = new Date(startsAt)
  const opts: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }
  const startStr = start.toLocaleString('ru-RU', opts)
  if (!endsAt) return startStr
  const end = new Date(endsAt)
  const endStr = end.toLocaleString('ru-RU', opts)
  return `${startStr} — ${endStr}`
}
