import { AuthorizeAnyZonePorts } from '../../domain/ports/authorize-any-zone.ports'


/**
 * Caso de uso para obtener si el empleado tiene permiso para registrar asistencia en cualquier zona
 * @class GetAuthorizeAnyZoneUsecase
 */
export class GetAuthorizeAnyZoneUsecase {
  /**
   * Constructor del caso de uso para obtener si el empleado tiene permiso para registrar asistencia en cualquier zona
   * @param {Pick<AuthorizeAnyZonePorts, 'getAuthorizeAnyZone'>} authorizeAnyZonePorts - Puerto definido para obtener si el empleado tiene permiso para registrar asistencia en cualquier zona
   */
  constructor(
    private readonly authorizeAnyZonePorts: Pick<AuthorizeAnyZonePorts, 'getAuthorizeAnyZone'>
  ) {}

  /**
   * Ejecuta el caso de uso para obtener si el empleado tiene permiso para registrar asistencia en cualquier zona
   * @returns {Promise<number>} Promesa que resuelve 1 si el empleado tiene permiso para registrar asistencia en cualquier zona, 0 si no tiene permiso
   */
  async run(): Promise<number> {
    const authorizeAnyZone = await this.authorizeAnyZonePorts.getAuthorizeAnyZone()
    return authorizeAnyZone
  }
}
