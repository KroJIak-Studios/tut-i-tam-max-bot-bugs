import React, { useState, useEffect, useCallback } from 'react'
import type { MapEvent } from '../types'
import {
  getMapEvents,
  toggleEventAttendance,
  setEventAttendance,
  getAttendanceMap,
} from '../services/mapService'
import { AttendanceContext } from './attendanceContextDef'

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendance, setAttendanceState] = useState<Record<string, boolean>>(() => getAttendanceMap())
  const [goingEvents, setGoingEvents] = useState<MapEvent[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const allEvents = await getMapEvents()
      const currentAttendance = getAttendanceMap()
      setAttendanceState(currentAttendance)
      setGoingEvents(allEvents.filter((e) => currentAttendance[e.id] ?? e.isGoing))
    } catch (err) {
      console.error('Failed to load going events:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    getMapEvents()
      .then((allEvents) => {
        if (!active) return
        const currentAttendance = getAttendanceMap()
        setAttendanceState(currentAttendance)
        setGoingEvents(allEvents.filter((e) => currentAttendance[e.id] ?? e.isGoing))
      })
      .catch((err) => {
        console.error('Failed to load initial events:', err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const isGoing = useCallback(
    (eventId: string) => {
      return !!attendance[eventId]
    },
    [attendance]
  )

  const toggleAttendance = useCallback(
    async (eventId: string): Promise<boolean> => {
      const updatedEvent = await toggleEventAttendance(eventId)
      const newStatus = !!updatedEvent.isGoing
      setAttendanceState((prev) => ({
        ...prev,
        [eventId]: newStatus,
      }))
      await loadData()
      return newStatus
    },
    [loadData]
  )

  const removeAttendance = useCallback(
    async (eventId: string): Promise<void> => {
      await setEventAttendance(eventId, false)
      setAttendanceState((prev) => ({
        ...prev,
        [eventId]: false,
      }))
      await loadData()
    },
    [loadData]
  )

  return (
    <AttendanceContext.Provider
      value={{
        attendance,
        isGoing,
        toggleAttendance,
        removeAttendance,
        goingEvents,
        loading,
        refresh: loadData,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  )
}
