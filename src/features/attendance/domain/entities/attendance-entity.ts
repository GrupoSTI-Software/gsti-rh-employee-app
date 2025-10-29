import { IAttendance } from '../types/attendance.interface'


/**
 * Entidad que representa la asistencia de un usuario
 * @class AttendanceEntity
 */
export class AttendanceEntity {
  /**
   * Constructor de la entidad de asistencia
   * @param {IAttendance} properties - Propiedades de la asistencia
   */
  constructor(private readonly properties: IAttendance) {}

  /**
   * Obtiene las propiedades de la asistencia
   * @returns {IAttendance} Propiedades de la asistencia
   */
  get props(): IAttendance {
    return this.properties
  }
}
