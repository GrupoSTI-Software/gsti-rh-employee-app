/**
 * Interfaz que define asistencia
 * @interface IAssistance
 */
export interface IAssistance {
  /**
   * Id del empleado
   * @type {number}
   */
  readonly employeeId: number

  /**
   * Coordenadas latitud
   * @type {number}
   */
  readonly assistLatitude: number

   /**
   * Coordenadas latitud
   * @type {number}
   */
  readonly assistLongitude: number

}
