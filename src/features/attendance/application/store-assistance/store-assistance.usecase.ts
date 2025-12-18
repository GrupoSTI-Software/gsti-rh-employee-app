import { AttendancePorts } from '../../domain/ports/attendance.ports'


/**
 * Caso de uso para guardar la asistencia de hoy del usuario
 * @class StoreAssistanceUsecase
 */
export class StoreAssistanceUsecase {
  /**
   * Constructor del caso de uso para registrar la asistencia del usuario
   * @param {Pick<AttendancePorts, 'getAuthCredentials'>} attendancePorts - Puerto definido para la autenticación
   */
  constructor(
    private readonly attendancePorts: Pick<AttendancePorts, 'storeAssist'>
  ) {}

  /**
   * Ejecuta el caso de uso para registrar la asistencia del usuario
   * @param {number} latitude - Latitud del usuario
   * @param {number} longitude - Longitud del usuario
   * @param {number} precision - Precisión de la ubicación
   * @returns {Promise<Boolean>} Promesa que resuelve el registro de asistencia o false si hay error
   */
  async run(latitude: number, longitude: number, precision: number): Promise<Boolean> {
    const attendance = await this.attendancePorts.storeAssist(latitude, longitude, precision)
    return attendance
  }
}
