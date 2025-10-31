import { GetAttendanceUsecase } from '../../../application/get-attendance/get-attendance.usecase'
import { AttendanceEntity } from '../../../domain/entities/attendance-entity'
import { AttendanceRepository } from '../../repositories/get-attendance/attendance.repository'


/**
 * Controlador para obtener las asistencias del usuario
 * @class GetAttendanceController
 */
export class GetAttendanceController {
  private readonly repository: AttendanceRepository
  private readonly usecase: GetAttendanceUsecase

  /**
   * Constructor del controlador de asistencias
   */
  constructor() {
    this.repository = new AttendanceRepository()
    this.usecase = new GetAttendanceUsecase(this.repository)
  }

  /**
   * Obtiene las asistencias del usuario
   * @returns {Promise<AttendanceEntity | null>} Promesa que resuelve a la entidad de asistencias o null si no existe
   */
  async getAttendance(): Promise<AttendanceEntity | null> {
    return await this.usecase.run()
  }
}
