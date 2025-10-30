import axios, { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { environment } from '../../../../../../config/environment'
import { AuthStateController } from '../../../../authentication/infrastructure/controllers/auth-state.controller'
import { ClearSessionController } from '../../../../authentication/infrastructure/controllers/clear-seassion.controller'
import { AttendancePorts } from '../../../domain/ports/attendance.ports.js'


/**
 * Repositorio que implementa la comunicación con la API para registrar las asistencias del usuario
 * @class AttendanceRepository
 */
export class AssistanceRepository implements Pick<AttendancePorts, 'storeAssist'>
{
  /**
   * Registra la asistencia del usuario
   * @returns {Promise<Boolean>} Promesa que resuelve el registro de asistencia o falso si hay error
   */
  async storeAssist(latitude: number, longitude: number): Promise<Boolean> {
    const { t } = useTranslation()
    try {
      
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

      const response = await axios.post(`${environment.API_URL}/v1/assists`, payload, {
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
    } catch (error) {
      console.error('Error registrando asistencia:', error)
      
      // Si es error 401, manejar sesión expirada
      if (error instanceof AxiosError && error.response?.status === 401) {
        const clearSessionController =  new ClearSessionController()
        try {
         
          await clearSessionController.clearSession()
          Alert.alert(
            t('screens.attendanceCheck.sessionExpired.title'),
            t('screens.attendanceCheck.sessionExpired.message'),
            [{ text: t('common.ok') }]
          )
        } catch (clearError) {
          console.error('Error clearing session:', clearError)
        }
      } else {
        // Mostrar error específico al usuario
        const errorMessage = error instanceof AxiosError 
          ? error.response?.data?.message || error.message
          : error instanceof Error 
            ? error.message 
            : 'Error desconocido al registrar asistencia'
        
        Alert.alert(
          t('common.error'),
          `${t('screens.attendanceCheck.registrationError')}: ${errorMessage}`
        )
      }
      return false
    }
  }
}
