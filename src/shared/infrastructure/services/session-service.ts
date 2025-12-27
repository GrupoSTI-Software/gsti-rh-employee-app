import axios from 'axios'
import { t } from 'i18next'
import { ClearSessionController } from '../../../features/authentication/infrastructure/controllers/clear-seassion.controller'
import { AlertService } from './alert-service'

type NavigateToLoginFunction = () => void

/**
 * Servicio para manejar la expiración de sesión de forma centralizada
 * Permite cerrar sesión y redirigir al login desde cualquier parte de la aplicación
 */
class SessionServiceClass {
  private navigateToLoginHandler: NavigateToLoginFunction | null = null
  private isHandlingExpiration: boolean = false
  private isInterceptorConfigured: boolean = false

  /**
   * Registra el manejador de navegación al login (usado por el SessionProvider)
   * @param {NavigateToLoginFunction} handler - Función que navega a la pantalla de login
   */
  setNavigateToLoginHandler(handler: NavigateToLoginFunction): void {
    this.navigateToLoginHandler = handler
  }

  /**
   * Limpia el manejador de navegación
   */
  clearNavigateToLoginHandler(): void {
    this.navigateToLoginHandler = null
  }

  /**
   * Configura el interceptor global de axios para manejar errores 401
   * Este método debe ser llamado una sola vez al iniciar la aplicación
   */
  setupGlobalAxiosInterceptor(): void {
    if (this.isInterceptorConfigured) {
      return
    }

    axios.interceptors.response.use(
      // Respuestas exitosas: pasar sin modificar
      (response) => response,
      // Errores: verificar si es 401 y manejar expiración de sesión
      async (error) => {
        if (error.response?.status === 401) {
          // Manejar expiración de sesión de forma centralizada
          await this.handleSessionExpired()
        }
        // Re-lanzar el error para que sea manejado por el código que hizo la petición
        return Promise.reject(error)
      }
    )

    this.isInterceptorConfigured = true
  }

  /**
   * Maneja la expiración de sesión (error 401)
   * - Limpia la sesión del usuario
   * - Muestra una alerta informativa
   * - Redirige automáticamente al login
   * @returns {Promise<void>}
   */
  async handleSessionExpired(): Promise<void> {
    // Evitar múltiples ejecuciones simultáneas
    if (this.isHandlingExpiration) {
      return
    }

    this.isHandlingExpiration = true

    try {
      // Limpiar la sesión del usuario
      const clearSessionController = new ClearSessionController()
      await clearSessionController.clearSession()

      // Navegar al login inmediatamente
      this.navigateToLogin()

      // Mostrar alerta informativa después de navegar
      AlertService.show(
        t('screens.attendanceCheck.sessionExpired.title'),
        t('screens.attendanceCheck.sessionExpired.message'),
        [
          {
            text: t('common.ok')
          }
        ]
      )

    } catch (error) {
      console.error('Error handling session expiration:', error)
      // Intentar navegar al login de todos modos
      this.navigateToLogin()
    } finally {
      // Resetear el flag después de un tiempo para permitir futuros manejos
      setTimeout(() => {
        this.isHandlingExpiration = false
      }, 5000)
    }
  }

  /**
   * Navega a la pantalla de login si el manejador está registrado
   */
  private navigateToLogin(): void {
    if (this.navigateToLoginHandler) {
      this.navigateToLoginHandler()
    } else {
      console.error('SessionService: No navigate to login handler registered')
    }
  }

  /**
   * Verifica si hay un manejador de navegación registrado
   * @returns {boolean} true si hay un manejador registrado
   */
  hasNavigationHandler(): boolean {
    return this.navigateToLoginHandler !== null
  }
}

// Exportar una instancia singleton
export const SessionService = new SessionServiceClass()

