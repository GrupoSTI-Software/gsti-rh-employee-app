import axios from 'axios'
import { t } from 'i18next'
import { getApi } from '../../../../../../presentation/utils/get-api-url'
import { AuthStateController } from '../../../../authentication/infrastructure/controllers/auth-state.controller'
import { AttendanceEntity } from '../../../domain/entities/attendance-entity'
import { AttendancePorts } from '../../../domain/ports/attendance.ports.js'


/**
 * Repositorio que implementa la comunicación con la API para obtener las asistencias del usuario
 * @class ZoneCoordinatesRepository
 */
export class ZoneCoordinatesRepository implements Pick<AttendancePorts, 'getAttendance'>
{
  getAttendance(): Promise<AttendanceEntity | null> {
    throw new Error(t('screens.attendanceCheck.methodNotImplemented'))
  }
  /**
   * Obtiene las asistencias del usuario
   * @returns {Promise<number[][][] | null>} Zonas con coordenadas o null si no existen
   */
  async getZoneCoordinates(): Promise<number[][][] | null> {
    const apiUrl = await getApi()
    const authStateController = new AuthStateController()
    // Obtener el token de autenticación
    const authState = await authStateController.getAuthState()
    const token = authState?.props.authState?.token

    if (!token) {
      throw new Error(t('errors.authTokenNotFound'))
    }
   
    const employeeId = authState?.props.authState?.user?.props.person?.props.employee?.props?.id?.value || null
     
    const response = await axios.get(`${apiUrl}/employees/${employeeId}/zones`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (response.status !== 200) {
      throw new Error(t('screens.attendanceCheck.errorFetchingZoneCoordinates'))
    }
    const responseData = response.data.data.coordinates as []
    
    
    return responseData
   
  }
}
