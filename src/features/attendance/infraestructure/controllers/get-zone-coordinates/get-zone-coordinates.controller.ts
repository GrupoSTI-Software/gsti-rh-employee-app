import { GetZoneCoordinatesUsecase } from '../../../application/get-zone-coordinates/get-zone-coordinates.usecase'
import { ZoneCoordinatesRepository } from '../../repositories/get-zone-coordinates/zone-coordinates.repository'


/**
 * Controlador para obtener las zonas permitidas para el usuario
 * @class GetZoneCoordinatesController
 */
export class GetZoneCoordinatesController {
  private readonly repository: ZoneCoordinatesRepository
  private readonly usecase: GetZoneCoordinatesUsecase

  /**
   * Constructor del controlador de zonas 
   */
  constructor() {
    this.repository = new ZoneCoordinatesRepository()
    this.usecase = new GetZoneCoordinatesUsecase(this.repository)
  }

  /**
   * Obtiene las zonas permitidas por medio de las coordenadas
   * @returns {Promise<number[][][] | null>} Promesa que resuelve las zonas permitidas o null si no existe
   */
  async getZoneCoordinates(): Promise<number[][][] | null> {
    return await this.usecase.run()
  }
}
