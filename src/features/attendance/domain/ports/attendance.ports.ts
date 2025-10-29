import { AttendanceEntity } from '../entities/attendance-entity'

/**
 * Interfaz que define los puertos de asistencia para la comunicación con servicios externos
 * @interface AttendancePorts
 */
export interface AttendancePorts {
  /**
   * Obtiene las asistencias de hoy del usuario
   * @returns {Promise<AttendanceEntity | null>} Promesa que resuelve las asistencias de hoy o null si no existe
   */
  getAttendance(): Promise<AttendanceEntity | null>
}
