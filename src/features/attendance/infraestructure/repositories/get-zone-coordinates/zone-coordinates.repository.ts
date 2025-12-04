import axios from 'axios'
import { environment } from '../../../../../../config/environment'
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
    throw new Error('Method not implemented.')
  }
  /**
   * Obtiene las asistencias del usuario
   * @returns {Promise<number[][][] | null>} Zonas con coordenadas o null si no existen
   */
  async getZoneCoordinates(): Promise<number[][][] | null> {
    const authStateController = new AuthStateController()
    // Obtener el token de autenticación
    const authState = await authStateController.getAuthState()
    const token = authState?.props.authState?.token

    if (!token) {
      throw new Error('Token de autenticación no encontrado')
    }
    
    if (!token) {
      throw new Error('Token de autenticación no encontrado')
    }

    const employeeId = authState?.props.authState?.user?.props.person?.props.employee?.props?.id?.value || null
    const response = await axios.get(`${environment.API_URL}/get-coordinates/&employeeId=${employeeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.status !== 200) {
      throw new Error('Error fetching zone coordinates')
    }
    // console.log(response.data.data.coordinates)
    const responseData = response.data.data.coordinates as []
    
    
    return responseData
  }
}
