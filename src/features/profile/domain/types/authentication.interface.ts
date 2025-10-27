import { ILoginCredentials } from '../../../authentication/domain/types/login-credentials.interface'
import { IAuthState } from './auth-state.interface'

/**
 * Interfaz que define las preferencias de biometría
 * @interface IBiometricsPreferences
 */
export interface IBiometricsPreferences {
  /**
   * Indica si la biometría ha sido configurada por el usuario
   * @type {boolean}
   */
  readonly isConfigured: boolean

  /**
   * Indica si la biometría está habilitada para autenticación
   * @type {boolean}
   */
  readonly isEnabled: boolean

  /**
   * Indica si el mensaje de configuración de biometría ha sido mostrado al usuario
   * @type {boolean}
   */
  readonly hasPromptBeenShown: boolean
}

/**
 * Interfaz que define la estructura de autenticación
 * @interface IAuthentication
 */
export interface IAuthentication {
  /**
   * Estado de autenticación del usuario
   * @type {IAuthState | undefined}
   */
  readonly authState?: IAuthState

  /**
   * Credenciales de inicio de sesión
   * @type {ILoginCredentials | undefined}
   */
  readonly loginCredentials?: ILoginCredentials

  /**
   * Preferencias de biometría para el usuario
   * @type {IBiometricsPreferences | undefined}
   */
  readonly biometricsPreferences?: IBiometricsPreferences

  /**
   * Fecha de creación de la autenticación
   * @type {Date}
   */
  readonly createdAt: Date
}
