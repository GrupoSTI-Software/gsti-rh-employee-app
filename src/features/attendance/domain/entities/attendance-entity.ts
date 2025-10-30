import { IAttendance } from '../types/attendance.interface'


/**
 * Entidad que representa las asistencias de un usuario
 * @class AttendanceEntity
 */
export class AttendanceEntity {
  /**
   * Constructor de la entidad de asistencias
   * @param {IAttendance} properties - Propiedades de las asistencias
   */
  constructor(private readonly properties: IAttendance) {}

  /**
   * Obtiene las propiedades de las asistencias
   * @returns {IAttendance} Propiedades de las asistencias
   */
  get props(): IAttendance {
    return this.properties
  }
}
