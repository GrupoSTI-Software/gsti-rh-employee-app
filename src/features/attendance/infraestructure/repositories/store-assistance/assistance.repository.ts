import axios from 'axios'
import { getApi } from '../../../../../../presentation/utils/get-api-url'
import { AuthStateController } from '../../../../authentication/infrastructure/controllers/auth-state.controller'
import { AttendancePorts } from '../../../domain/ports/attendance.ports.js'


/**
 * Repositorio que implementa la comunicación con la API para registrar las asistencias del usuario
 * @class AttendanceRepository
 */
export class AssistanceRepository implements Pick<AttendancePorts, 'storeAssist'>
{
  /**
   * Registra la asistencia del usuario
   * @param {number} latitude - Latitud de la ubicación
   * @param {number} longitude - Longitud de la ubicación  
   * @returns {Promise<Boolean>} Promesa que resuelve el registro de asistencia o falso si hay error
   */
  async storeAssist(latitude: number, longitude: number): Promise<Boolean> {
    const apiUrl = await getApi()
    const authStateController = new AuthStateController()
      
    // Obtener el token de autenticación y employeeId
    const authState = await authStateController.getAuthState()
    const token = authState?.props.authState?.token
    
    if (!token) {
      throw new Error('Token de autenticación no encontrado')
    }

    const employeeId = authState?.props.authState?.user?.props.person?.props.employee?.props?.id?.value || null
    if (!employeeId) {
      throw new Error('Employee ID no encontrado')
    }

    const payload = {
      employeeId,
      assistLatitude: latitude,
      assistLongitude: longitude
    }

    const response = await axios.post(`${apiUrl}/v1/assists`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (response.status === 201) {
      return true
    } else {
      console.error('Respuesta inesperada del servidor:', response.status)
      return false
    }
  }
}
