import { StoreAssistanceUsecase } from '../../../application/store-assistance/store-assistance.usecase'
import { AssistanceRepository } from '../../repositories/store-assistance/assistance.repository'


/**
 * Controlador para registrar las asistencias del usuario
 * @class StoreAssistanceController
 */
export class StoreAssistanceController {
  private readonly repository: AssistanceRepository
  private readonly usecase: StoreAssistanceUsecase

  /**
   * Constructor del controlador de asistencias
   */
  constructor() {
    this.repository = new AssistanceRepository()
    this.usecase = new StoreAssistanceUsecase(this.repository)
  }

  /**
   * Registra la asistencia del usuario
   * @param {number} latitude - Latitud de la ubicación
   * @param {number} longitude - Longitud de la ubicación
   * @param {number} precision - Precisión de la ubicación
   * @returns {Promise<Boolean>} Promesa que resuelve el registro y devuelve true o false si hay error
   */
  async storeAssist(latitude: number, longitude: number, precision: number): Promise<Boolean> {
    return await this.usecase.run(latitude, longitude, precision)
  }
}
