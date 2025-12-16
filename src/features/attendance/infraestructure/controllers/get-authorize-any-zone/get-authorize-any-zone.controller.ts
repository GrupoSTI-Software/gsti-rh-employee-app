import { GetAuthorizeAnyZoneUsecase } from '../../../application/get-authorize-any-zone/get-authorize-any-zone.usecase'
import { AuthorizeAnyZoneRepository } from '../../repositories/get-authorize-any-zone/get-authorize-any-zone.repository'


/**
 * Controlador para obtener si el empleado tiene permiso para registrar asistencia en cualquier zona
 * @class GetAuthorizeAnyZoneController
 */
export class GetAuthorizeAnyZoneController {
  private readonly repository: AuthorizeAnyZoneRepository
  private readonly usecase: GetAuthorizeAnyZoneUsecase

  /**
   * Constructor del controlador de zonas 
   */
  constructor() {
    this.repository = new AuthorizeAnyZoneRepository()
    this.usecase = new GetAuthorizeAnyZoneUsecase(this.repository)
  }

  /**
   * Obtiene si el empleado tiene permiso para registrar asistencia en cualquier zona
   * @returns {Promise<number>} Promesa que resuelve 1 si el empleado tiene permiso para registrar asistencia en cualquier zona, 0 si no tiene permiso
   */
  async getAuthorizeAnyZone(): Promise<number> {
    return await this.usecase.run()
  } 
}
