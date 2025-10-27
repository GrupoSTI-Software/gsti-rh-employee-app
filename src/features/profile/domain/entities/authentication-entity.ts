import { IAuthentication } from '../types/authentication.interface'


/**
 * Entidad que representa la autenticación de un usuario
 * @class AuthenticationEntity
 */
export class AuthenticationEntity {
  /**
   * Constructor de la entidad de autenticación
   * @param {IAuthentication} properties - Propiedades de la autenticación
   */
  constructor(private readonly properties: IAuthentication) {}

  /**
   * Obtiene las propiedades de la autenticación
   * @returns {IAuthentication} Propiedades de la autenticación
   */
  get props(): IAuthentication {
    return this.properties
  }
}
