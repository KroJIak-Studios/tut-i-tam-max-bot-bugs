import { useState, useEffect, useCallback, useRef } from 'react'
import { moderationApi } from '../api/moderationApi'
import type { ModerationCounts } from '../types'

/** Custom event dispatched after any moderation action to refresh counts. */
export const MODERATION_UPDATED_EVENT = 'tut_i_tam_moderation_updated'

/** Dispatch this event to signal sidebar/other consumers to refresh counts. */
export function dispatchModerationUpdated(): void {
  window.dispatchEvent(new CustomEvent(MODERATION_UPDATED_EVENT))
}

/**
 * Lightweight hook that fetches moderation counts from the real API.
 * Used by AdminLayout sidebar badge.
 * Does NOT poll — refreshes on mount and on MODERATION_UPDATED_EVENT.
 */
export function useModerationCounts(): {
  counts: ModerationCounts | null
  pendingCount: number
  refresh: () => void
} {
  const [counts, setCounts] = useState<ModerationCounts | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const refresh = useCallback(() => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    moderationApi
      .getQueue({ limit: 1, offset: 0 })
      .then((res) => {
        if (!ctrl.signal.aborted) {
          setCounts(res.counts)
        }
      })
      .catch(() => {
        // silently ignore — sidebar badge is best-effort
      })
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener(MODERATION_UPDATED_EVENT, refresh)
    return () => {
      abortRef.current?.abort()
      window.removeEventListener(MODERATION_UPDATED_EVENT, refresh)
    }
  }, [refresh])

  return {
    counts,
    pendingCount: counts?.pending ?? 0,
    refresh,
  }
}
