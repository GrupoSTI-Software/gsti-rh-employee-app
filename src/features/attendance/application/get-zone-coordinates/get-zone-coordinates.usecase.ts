import { ZoneCoordinatesPorts } from '../../domain/ports/zone-coordinates.ports'


/**
 * Caso de uso para obtener las zonas permitidas del usuario
 * @class GetAttendanceUsecase
 */
export class GetZoneCoordinatesUsecase {
  /**
   * Constructor del caso de uso para obtener las zonas permitidas del usuario
   * @param {Pick<ZoneCoordinatesPorts, 'getZoneCoordinates'>} zoneCoordinatesPorts - Puerto definido para obtener las zonas permitidas del usuario
   */
  constructor(
    private readonly zoneCoordinatesPorts: Pick<ZoneCoordinatesPorts, 'getZoneCoordinates'>
  ) {}

  /**
   * Ejecuta el caso de uso para obtener las zonas permitidas del usuario
   * @returns {Promise<number[][][] | null>}} Promesa que resuelve a la entidad de asistencia o null si no existe
   */
  async run(): Promise<number[][][] | null> {
    const coordinates = await this.zoneCoordinatesPorts.getZoneCoordinates()
    return coordinates
  }
}
