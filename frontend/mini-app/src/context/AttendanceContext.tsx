import React, { useState, useEffect, useCallback } from 'react'
import type { MapEvent } from '../types'
import { getMyAttendances, toggleEventAttendance, setEventAttendance } from '../services/mapService'
import { AttendanceContext } from './attendanceContextDef'

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendance, setAttendanceState] = useState<Record<string, boolean>>({})
  const [goingEvents, setGoingEvents] = useState<MapEvent[]>([])
  const [loading, setLoading] = useState(true)
  const loadData = useCallback(async () => { try { const events = await getMyAttendances('upcoming'); setGoingEvents(events); setAttendanceState(Object.fromEntries(events.map((event) => [event.id, true]))) } finally { setLoading(false) } }, [])
  useEffect(() => { void loadData() }, [loadData])
  const isGoing = useCallback((id: string) => !!attendance[id], [attendance])
  const toggleAttendance = useCallback(async (id: string) => { const event = await toggleEventAttendance(id); setAttendanceState((prev) => ({ ...prev, [id]: !!event.isGoing })); await loadData(); return !!event.isGoing }, [loadData])
  const removeAttendance = useCallback(async (id: string) => { await setEventAttendance(id, false); setAttendanceState((prev) => ({ ...prev, [id]: false })); await loadData() }, [loadData])
  return <AttendanceContext.Provider value={{ attendance, isGoing, toggleAttendance, removeAttendance, goingEvents, loading, refresh: loadData }}>{children}</AttendanceContext.Provider>
}
