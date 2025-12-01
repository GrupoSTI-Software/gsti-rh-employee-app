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
   * @returns {Promise<AttendanceEntity | null>} Promesa que resuelve a la entidad de asistencia o null si no existe
   */
  async run(): Promise<AttendanceEntity | null> {
    const attendance = await this.attendancePorts.getAttendance()
    return attendance
  }
}
