import { IAssistance } from './assistance.interface'
import { IException } from './exception.interface'

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
   * @type {boolean}
   */
  readonly isRestDay: boolean

  /**
   * Es día con incapacidad
   * @type {boolean}
   */
  readonly isWorkDisabilityDate: boolean

  /**
   * Es día de vacaciones
   * @type {boolean}
   */
  readonly isVacationDate: boolean

  /**
   * Es día de vacaciones
   * @type {boolean}
   */
  readonly isHoliday: boolean

  /**
   * Lista de registros del día
   * @type {Array<IAssistance>}
   */
  readonly assitFlatList: Array<IAssistance>

  /**
   * Lista de excepciones del día
   * @type {Array<IException>}
   */
  readonly exceptions: Array<IException>
}
