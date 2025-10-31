// attendance.utils.ts
import { DateTime } from 'luxon'

/**
 * Verifica si ya es hora de mostrar los datos de salida
 * @param shiftEndTime - hora de fin del turno en formato HH:mm
 * @returns true si ya es hora de salida o después
 */
export const isCheckOutTimeReached = (shiftEndTime?: string): boolean => {
  if (!shiftEndTime) return true

  try {
    const now = DateTime.now().setLocale('es')
    const endTimeToday = DateTime.fromFormat(shiftEndTime, 'HH:mm').set({
      year: now.year,
      month: now.month,
      day: now.day
    })
    return now >= endTimeToday
  } catch {
    return true
  }
}
