import { AttendanceEntity } from '../../domain/entities/attendance-entity'
import { AttendancePorts } from '../../domain/ports/attendance.ports'


/**
 * Caso de uso para obtener las asistencias de hoy del usuario
 * @class GetAttendanceUsecase
 */
export class GetAttendanceUsecase {
  /**
   * Constructor del caso de uso para obtener las asistencias del usuario
   * @param {Pick<AttendancePorts, 'getAuthCredentials'>} attendancePorts - Puerto definido para la autenticación
   */
  constructor(
    private readonly attendancePorts: Pick<AttendancePorts, 'getAttendance'>
  ) {}

  /**
   * Ejecuta el caso de uso para obtener las asistencias del usuario
   * @param {string} dateStart - Fecha inicial
   * @param {string} dateEnd - Fecha final
   * @returns {Promise<AttendanceEntity | null>} Promesa que resuelve a la entidad de asistencia o null si no existe
   */
  async run(dateStart: string, dateEnd: string): Promise<AttendanceEntity | null> {
    const attendance = await this.attendancePorts.getAttendance(dateStart, dateEnd)
    return attendance
  }
}
