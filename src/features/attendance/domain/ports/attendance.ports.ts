import { AttendanceEntity } from '../entities/attendance-entity'

/**
 * Interfaz que define los puertos de asistencia para la comunicación con servicios externos
 * @interface AttendancePorts
 */
export interface AttendancePorts {
  /**
   * Obtiene las asistencias de hoy del usuario
   * @param {string} dateStart - Fecha inicial
   * @param {string} dateEnd - Fecha final
   * @returns {Promise<AttendanceEntity | null>} Promesa que resuelve las asistencias de hoy o null si no existe
   */
  getAttendance(dateStart: string, dateEnd: string): Promise<AttendanceEntity | null>

  /**
   * Registra la asistencia del usuario
   * @param {number} latitude - Latitud del usuario
   * @param {number} longitude - Longitud del usuario
   * @returns {Promise<Boolean>} Promesa que resuelve el registro de asistencia o falso si hay error
   */
  storeAssist(latitude: number, longitude: number): Promise<Boolean>
}
