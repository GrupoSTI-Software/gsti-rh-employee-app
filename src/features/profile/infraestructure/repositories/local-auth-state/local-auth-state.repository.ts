 

import { AuthenticationEntity } from '../../../domain/entities/authentication-entity.js'
import { AuthenticationPorts } from '../../../domain/ports/authentication.ports.js'
import { AuthenticationLocalStorageService } from '../../services/authentication-local-storage.service'

/**
 * Repositorio que implementa la comunicación con el almacenamiento local para obtener el estado de autenticación del usuario
 * @class LocalAuthStateRepository
 */
export class LocalAuthStateRepository implements Pick<AuthenticationPorts, 'getAuthState'>
{
  /**
   * Obtiene el estado de autenticación del usuario desde el almacenamiento local en el dispositivo
   * @returns {Promise<AuthenticationEntity | null>} Estado de autenticación del usuario o null si no existe
   */
  async getAuthState(): Promise<AuthenticationEntity | null> {
    const authenticationLocalStorageService = new AuthenticationLocalStorageService()
    const state = await authenticationLocalStorageService.localGetAuthenticationState()
    return state
  }
}
