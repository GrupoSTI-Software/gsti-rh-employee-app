/**
 * Interfaz que define asistencias
 * @interface IAttendance
 */
export interface IAttendance {
  /**
   * Hora de entrada
   * @type {string}
   */
  readonly checkInTime: string | null

  /**
   * Hora de salida
   * @type {string}
   */
  readonly checkOutTime: string | null

  /**
   * Hora de entrada a comer
   * @type {string}
   */
  readonly checkEatInTime: string | null

  /**
   * Hora de salida a comer
   * @type {string}
   */
  readonly checkEatOutTime: string | null

  /**
   * Status de entrada
   * @type {string}
   */
  readonly checkInStatus: string | null

  /**
   * Status de salida
   * @type {string}
   */
  readonly checkOutStatus: string | null

  /**
   * Status de entrada a comer
   * @type {string}
   */
  readonly checkEatInStatus: string | null

  /**
   * Status de salida a comer
   * @type {string}
   */
  readonly checkEatOutStatus: string | null

  /**
   * Información del turno
   * @type {string}
   */
  readonly shiftInfo: string | null
  
  /**
   * Es día de descanso
   * @type {string}
   */
  readonly isRestDay: boolean

  /**
   * Es día con incapacidad
   * @type {string}
   */
  readonly isWorkDisabilityDate: boolean

  /**
   * Es día de vacaciones
   * @type {string}
   */
  readonly isVacationDate: boolean

  /**
   * Es día de vacaciones
   * @type {string}
   */
  readonly isHoliday: boolean

}
