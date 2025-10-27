import { GetAuthStateUsecase } from '../../application/get-auth-state/get-auth-state.usecase'
import { AuthenticationEntity } from '../../domain/entities/authentication-entity'
import { LocalAuthStateRepository } from '../repositories/local-auth-state/local-auth-state.repository'



/**
 * Controlador para obtener el estado de autenticación del usuario
 * @class AuthStateController
 */
export class AuthStateController {
  private readonly repository: LocalAuthStateRepository
  private readonly usecase: GetAuthStateUsecase

  /**
   * Constructor del controlador de autenticación
   */
  constructor() {
    this.repository = new LocalAuthStateRepository()
    this.usecase = new GetAuthStateUsecase(this.repository)
  }

  /**
   * Obtiene el estado de autenticación del usuario
   * @returns {Promise<AuthenticationEntity | null>} Promesa que resuelve a la entidad de autenticación con los datos de sesión o null si no existe
   */
  async getAuthState(): Promise<AuthenticationEntity | null> {
    return await this.usecase.run()
  }
}
