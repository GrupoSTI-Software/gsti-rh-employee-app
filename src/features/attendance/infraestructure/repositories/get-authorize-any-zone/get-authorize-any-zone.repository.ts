import axios from 'axios'
import { t } from 'i18next'
import { getApi } from '../../../../../../presentation/utils/get-api-url'
import { AuthStateController } from '../../../../authentication/infrastructure/controllers/auth-state.controller'
import { AuthorizeAnyZonePorts } from '../../../domain/ports/authorize-any-zone.ports'


/**
 * Repositorio que implementa la comunicación con la API para obtener si el empleado tiene permiso para registrar asistencia en cualquier zona
 * @class AuthorizeAnyZoneRepository
 */
export class AuthorizeAnyZoneRepository implements Pick<AuthorizeAnyZonePorts, 'getAuthorizeAnyZone'>
{
  /**
   * Obtiene si el empleado tiene permiso para registrar asistencia en cualquier zona
   * @returns {Promise<number>} Promesa que resuelve 1 si el empleado tiene permiso para registrar asistencia en cualquier zona, 0 si no tiene permiso
   */
  async getAuthorizeAnyZone(): Promise<number> {
    const apiUrl = await getApi()
    const authStateController = new AuthStateController()
    // Obtener el token de autenticación
    const authState = await authStateController.getAuthState()
    const token = authState?.props.authState?.token

    if (!token) {
      throw new Error(t('errors.authTokenNotFound'))
    }
   
    const employeeId = authState?.props.authState?.user?.props.person?.props.employee?.props?.id?.value || null
     
    const response = await axios.get(`${apiUrl}/employees/${employeeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (response.status !== 200) {
      throw new Error(t('screens.attendanceCheck.errorFetchingAuthorizeAnyZone'))
    }
    const employeeAuthorizeAnyZones = response.data.data.employee.employeeAuthorizeAnyZones as number
    return employeeAuthorizeAnyZones
  }
}
