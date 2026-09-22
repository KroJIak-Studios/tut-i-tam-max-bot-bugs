import { useContext } from 'react'
import { AttendanceContext, type AttendanceContextValue } from './attendanceContextDef'

export const useAttendance = (): AttendanceContextValue => {
  const ctx = useContext(AttendanceContext)
  if (!ctx) {
    throw new Error('useAttendance must be used within an AttendanceProvider')
  }
  return ctx
}
