
/**
 * Interfaz que define los puertos de zonas permitidas para la comunicación con servicios externos
 * @interface ZoneCoordinatesPorts
 */
export interface ZoneCoordinatesPorts {
  /**
   * Obtiene las zonas permitidas del usuario para registrar asistencia
   * @returns {Promise<Array<Array<number>> | null>} Promesa que resuelve las zonas permitidas o null si no existe
   */
  getZoneCoordinates(): Promise<Array<Array<number>> | null>
}
