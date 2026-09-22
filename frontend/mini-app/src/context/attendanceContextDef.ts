import { createContext } from 'react'
import type { MapEvent } from '../types'

export interface AttendanceContextValue {
  attendance: Record<string, boolean>
  isGoing: (eventId: string) => boolean
  toggleAttendance: (eventId: string) => Promise<boolean>
  removeAttendance: (eventId: string) => Promise<void>
  goingEvents: MapEvent[]
  loading: boolean
  refresh: () => Promise<void>
}

export const AttendanceContext = createContext<AttendanceContextValue | null>(null)
