
/**
 * Interfaz que define los puertos de permiso para saber si el empleado tiene permiso para registrar asistencia en cualquier zona
 * @interface AuthorizeAnyZonePorts
 */
export interface AuthorizeAnyZonePorts {
  /**
   * Obtiene si el empleado tiene permiso para registrar asistencia en cualquier zona
   * @returns {Promise<number>} Promesa que resuelve 1 si el empleado tiene permiso para registrar asistencia en cualquier zona, 0 si no tiene permiso
   */
  getAuthorizeAnyZone(): Promise<number>
}
