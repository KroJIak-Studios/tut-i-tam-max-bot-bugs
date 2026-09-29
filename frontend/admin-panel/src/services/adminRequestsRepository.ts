import type {
  AdminEventRequest,
  AdminFilterState,
} from '../types/request'
import { INITIAL_ADMIN_REQUESTS } from '../mocks/adminRequestsData'

const STORAGE_KEY = 'tut_i_tam_admin_requests'
export const ADMIN_REQUESTS_CHANGED_EVENT = 'tut_i_tam_admin_requests_changed'

function loadFromStorage(): AdminEventRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_REQUESTS))
      return INITIAL_ADMIN_REQUESTS
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_REQUESTS))
      return INITIAL_ADMIN_REQUESTS
    }
    return parsed as AdminEventRequest[]
  } catch {
    return INITIAL_ADMIN_REQUESTS
  }
}

function saveToStorage(requests: AdminEventRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
    window.dispatchEvent(new CustomEvent(ADMIN_REQUESTS_CHANGED_EVENT))
  } catch {
    // ignore
  }
}

export async function getRequests(
  filter?: Partial<AdminFilterState>,
): Promise<AdminEventRequest[]> {
  await new Promise((resolve) => setTimeout(resolve, 30))
  let list = loadFromStorage()

  if (filter?.status && filter.status !== 'all') {
    list = list.filter((r) => r.status === filter.status)
  }

  if (filter?.category && filter.category !== 'all') {
    list = list.filter((r) => r.category === filter.category)
  }

  if (filter?.locationMode && filter.locationMode !== 'all') {
    list = list.filter((r) => r.locationMode === filter.locationMode)
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase().trim()
    list = list.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.author.name.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q),
    )
  }

  const sort = filter?.sort || 'newest'
  list.sort((a, b) => {
    const timeA = new Date(a.submittedAt).getTime()
    const timeB = new Date(b.submittedAt).getTime()
    return sort === 'newest' ? timeB - timeA : timeA - timeB
  })

  return list
}

export async function getRequestById(
  id: string,
): Promise<AdminEventRequest | null> {
  await new Promise((resolve) => setTimeout(resolve, 20))
  const list = loadFromStorage()
  return list.find((r) => r.id === id) || null
}

export async function approveRequest(
  id: string,
  comment?: string,
): Promise<AdminEventRequest> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  const list = loadFromStorage()
  const idx = list.findIndex((r) => r.id === id)
  if (idx === -1) {
    throw new Error(`Request with ID ${id} not found`)
  }

  const updated: AdminEventRequest = {
    ...list[idx],
    status: 'approved',
    moderatorComment: comment?.trim() ? comment.trim() : undefined,
    moderatedAt: new Date().toISOString(),
    moderatorName: 'Анна К.',
  }

  list[idx] = updated
  saveToStorage(list)
  return updated
}

export async function rejectRequest(
  id: string,
  reason: string,
): Promise<AdminEventRequest> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  if (!reason.trim()) {
    throw new Error('Причина отклонения обязательна для заполнения')
  }

  const list = loadFromStorage()
  const idx = list.findIndex((r) => r.id === id)
  if (idx === -1) {
    throw new Error(`Request with ID ${id} not found`)
  }

  const updated: AdminEventRequest = {
    ...list[idx],
    status: 'rejected',
    moderatorComment: reason.trim(),
    moderatedAt: new Date().toISOString(),
    moderatorName: 'Анна К.',
  }

  list[idx] = updated
  saveToStorage(list)
  return updated
}

export async function requestChanges(
  id: string,
  comment: string,
): Promise<AdminEventRequest> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  if (!comment.trim()) {
    throw new Error('Укажите комментарий модератора для запроса уточнений')
  }

  const list = loadFromStorage()
  const idx = list.findIndex((r) => r.id === id)
  if (idx === -1) {
    throw new Error(`Request with ID ${id} not found`)
  }

  const updated: AdminEventRequest = {
    ...list[idx],
    status: 'needs_changes',
    moderatorComment: comment.trim(),
    moderatedAt: new Date().toISOString(),
    moderatorName: 'Анна К.',
  }

  list[idx] = updated
  saveToStorage(list)
  return updated
}

export async function getRequestsStats(): Promise<{
  total: number
  pending: number
  needsChanges: number
  approved: number
  rejected: number
}> {
  const list = loadFromStorage()
  return {
    total: list.length,
    pending: list.filter((r) => r.status === 'pending').length,
    needsChanges: list.filter((r) => r.status === 'needs_changes').length,
    approved: list.filter((r) => r.status === 'approved').length,
    rejected: list.filter((r) => r.status === 'rejected').length,
  }
}

export async function resetToDefaults(): Promise<AdminEventRequest[]> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_REQUESTS))
  window.dispatchEvent(new CustomEvent(ADMIN_REQUESTS_CHANGED_EVENT))
  return INITIAL_ADMIN_REQUESTS
}
