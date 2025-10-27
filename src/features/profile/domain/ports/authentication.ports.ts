import { AuthenticationEntity } from '../entities/authentication-entity'


/**
 * Interfaz que define los puertos de autenticación para la comunicación con servicios externos
 * @interface AuthenticationPorts
 */
export interface AuthenticationPorts {
  /**
   * Realiza el proceso de autenticación del usuario.
   * <br />
   * - Inicia sesión y almacena las credenciales del usuario en el almacenamiento local si la autenticación es exitosa.
   * @param {AuthenticationEntity} authenticationEntity - Entidad con las credenciales de autenticación
   * @returns {Promise<AuthenticationEntity>} Promesa que resuelve a la entidad de autenticación con los datos de sesión
   */
  login(
    authenticationEntity: AuthenticationEntity
  ): Promise<AuthenticationEntity>

  /**
   * Obtiene las credenciales de autenticación del usuario
   * @returns {Promise<AuthenticationEntity | null>} Promesa que resuelve a la entidad de autenticación con los datos de sesión o null si no existe
   */
  getAuthCredentials(): Promise<AuthenticationEntity | null>

  /**
   * Obtiene el estado de autenticación del usuario
   * @returns {Promise<AuthenticationEntity | null>} Promesa que resuelve a la entidad de autenticación con los datos de sesión o null si no existe
   */
  getAuthState(): Promise<AuthenticationEntity | null>

  /**
   * Elimina la sesión del usuario
   * <br />
   * - Elimina el estado de autenticación manteniendo al usuario en memoria local
   * @returns {Promise<void>} Promesa que resuelve cuando la sesión se ha eliminado
   */
  clearSession(): Promise<void>

  /**
   * Cierra sesión y redirige a la pantalla de autenticación
   * <br />
   * - Redirige a la pantalla de autenticación
   * - Elimina por completo el estado de autenticación
   * @returns {Promise<void>} Promesa que resuelve cuando la sesión se ha cerrado
   */
  logout(): Promise<void>
}
