import i18next from 'i18next'
import { ELoginTypes } from '../../application/types/login-types.enum'
import { AuthStateController } from '../controllers/auth-state.controller'
import { LoginController } from '../controllers/login.controller'

/**
 * Interfaz para el resultado de la autenticación por contraseña
 * @interface IPasswordAuthResult
 */
export interface IPasswordAuthResult {
  /**
   * Indica si la autenticación fue exitosa
   * @type {boolean}
   */
  success: boolean

  /**
   * Mensaje de error en caso de que la autenticación falle
   * @type {string | undefined}
   */
  error?: string
}

/**
 * Servicio para gestionar la autenticación por contraseña mediante prompts
 * @class PasswordPromptService
 */
export class PasswordPromptService {
  /**
   * Valida la contraseña ingresada contra las credenciales almacenadas
   * @param {string} password - Contraseña a validar
   * @returns {Promise<void>} Promesa que resuelve si la contraseña es válida
   * @throws {Error} Si la contraseña es inválida o hay problemas de autenticación
   * @private
   */
  public async validatePassword(password: string): Promise<void> {
    try {
      // Obtener las credenciales almacenadas del usuario actual
      const authStateController = new AuthStateController()
      const authState = await authStateController.getAuthState()

      if (!authState?.props.loginCredentials?.email) {
        throw new Error(i18next.t('errors.noStoredCredentials'))
      }

      // Intentar autenticar con las credenciales proporcionadas
      const loginController = new LoginController()
      await loginController.login({
        email: authState.props.loginCredentials.email,
        password: password,
        type: ELoginTypes.EMAIL
      })

      // Si llegamos aquí, la autenticación fue exitosa
      return Promise.resolve()
    } catch {
      // Si hay un error de autenticación, la contraseña es incorrecta
      throw new Error(i18next.t('errors.invalidPassword'))
    }
  }
}
