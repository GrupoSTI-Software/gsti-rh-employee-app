import { IAssistance } from '../types/assistance.interface'

/**
 * Entidad que representa la asistencia de un usuario
 * @class AssistanceEntity
 */
export class AssistanceEntity {
  /**
   * Constructor de la entidad de asistencia
   * @param {IAssistance} properties - Propiedades de la asistencia
   */
  constructor(private readonly properties: IAssistance) {}

  /**
   * Obtiene las propiedades de la asistencia
   * @returns {IAssistance} Propiedades de la asistencia
   */
  get props(): IAssistance {
    return this.properties
  }
}
