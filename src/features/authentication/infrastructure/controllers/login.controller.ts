import i18next from 'i18next'
import { ILoginAuthenticationDTO } from '../../application/login-authentication/login-authentication.dto'
import { LoginAuthenticationUsecase } from '../../application/login-authentication/login-authentication.usecase'
import { AuthenticationEntity } from '../../domain/entities/authentication-entity'
import { IBiometricsPreferences } from '../../domain/types/authentication.interface'
import { LoginRepositoryFactory } from '../factories/login-repository.factory'
import { AuthenticationLocalStorageService } from '../services/authentication-local-storage.service'

/**
 * Controlador para la autenticación de usuarios
 * @class LoginController
 */
export class LoginController {
  private loginAuthentication!: LoginAuthenticationUsecase

  /**
   * Procesa la solicitud de inicio de sesión de un usuario.
   * <br />
   * - Inicia sesión y almacena las credenciales del usuario en el almacenamiento local si la autenticación es exitosa.
   * @param {ILoginAuthenticationDTO} loginAuthenticationDTO - Objeto con las credenciales (email y password) del usuario
   * @returns {Promise<AuthenticationEntity>} Promesa que resuelve a un objeto Authentication con los datos de la sesión
   * @throws { Error } si hay problemas de conexión con la API
   */
  async login(loginAuthenticationDTO: ILoginAuthenticationDTO): Promise<AuthenticationEntity> {
    const loginRepository = new LoginRepositoryFactory().repository(loginAuthenticationDTO.type)

    this.loginAuthentication = new LoginAuthenticationUsecase(loginRepository)

    const authentication = new AuthenticationEntity({
      loginCredentials: {
        email: loginAuthenticationDTO.email,
        password: loginAuthenticationDTO.password
      },
      createdAt: new Date()
    })

    const authenticationResult = await this.loginAuthentication.run(authentication)
    const isAuthenticated = authenticationResult?.props?.authState?.isAuthenticated as boolean

    if (!isAuthenticated) {
      throw new Error(i18next.t('errors.loginFailed'))
    }

    // Set default biometrics preferences for first login
    // await this.setDefaultBiometricsPreferences(authenticationResult)

    return authenticationResult
  }

  /**
   * Sets default biometrics preferences for first-time login
   * If the user has no biometrics preferences set, we'll set default values:
   * - isConfigured: false (not configured yet)
   * - isEnabled: false (not enabled yet)
   * - hasPromptBeenShown: false (prompt has not been shown yet)
   * 
   * @param {AuthenticationEntity} authentication - The authentication entity
   * @returns {Promise<void>}
   */
  private async setDefaultBiometricsPreferences(authentication: AuthenticationEntity): Promise<void> {
    try {
      // Only set default preferences if they don't exist yet
      if (!authentication.props.biometricsPreferences) {
        // Default biometrics preferences
        const defaultBiometricsPreferences: IBiometricsPreferences = {
          isConfigured: false,
          isEnabled: false,
          hasPromptBeenShown: false
        }

        // Create updated authentication entity with default biometrics preferences
        const updatedAuth = new AuthenticationEntity({
          ...authentication.props,
          biometricsPreferences: defaultBiometricsPreferences
        })

        // Save updated authentication entity
        const storageService = new AuthenticationLocalStorageService()
        await storageService.localStoreAuthenticationState(updatedAuth)
      }
    } catch (error) {
      console.error('Error setting default biometrics preferences:', error)
      // We don't throw here to avoid interrupting the login flow
    }
  }
}
