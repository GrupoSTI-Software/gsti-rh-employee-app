import { IEvidence } from './evidence.interface'

/**
 * Interfaz que define excepción
 * @interface IException
 */
export interface IException {
  /**
   * Id de la excepción
   * @type {number}
   */
  readonly shiftExceptionId: number

  /**
   * Tipo de excepción
   * @type {string}
   */
  readonly type: string

   /**
   * Descripción de la excepción
   * @type {string}
   */
  readonly shiftExceptionsDescription: string

  /**
   * Hora de entrada de la excepción
   * @type {string}
   */
  readonly shiftExceptionCheckInTime: string

  /**
   * Hora de salida de la excepción
   * @type {string}
   */
  readonly shiftExceptionCheckOutTime: string

  /**
   * Lista de evidencias de la excepción
   * @type {Array<IEvidence>}
   */
  readonly evidences: Array<IEvidence>

}
