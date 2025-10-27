import { AuthenticationEntity } from '../../domain/entities/authentication-entity.js'
import { AuthenticationPorts } from '../../domain/ports/authentication.ports.js'

/**
 * Caso de uso para obtener las credenciales de autenticación del usuario
 * @class GetAuthCredentialsUsecase
 */
export class GetAuthStateUsecase {
  /**
   * Constructor del caso de uso para obtener las credenciales de autenticación del usuario
   * @param {Pick<AuthenticationPorts, 'getAuthState'>} authenticationPorts - Puerto definido para la autenticación
   */
  constructor(
    private readonly authenticationPorts: Pick<AuthenticationPorts, 'getAuthState'>
  ) {}

  /**
   * Ejecuta el caso de uso para obtener el estado de autenticación del usuario
   * @returns {Promise<AuthenticationEntity | null>} Promesa que resuelve a la entidad de autenticación con los datos de sesión o null si no existe
   */
  async run(): Promise<AuthenticationEntity | null> {
    const state = await this.authenticationPorts.getAuthState()
    return state
  }
}
