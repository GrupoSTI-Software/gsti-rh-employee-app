 

import axios from 'axios'
import { DateTime } from 'luxon'
import { useMemo } from 'react'
import { environment } from '../../../../../../config/environment'
import { AuthStateController } from '../../../../authentication/infrastructure/controllers/auth-state.controller'
import { AttendanceEntity } from '../../../domain/entities/attendance-entity.js'
import { AttendancePorts } from '../../../domain/ports/attendance.ports.js'


/**
 * Repositorio que implementa la comunicación con la API para obtener las asistencias del usuario
 * @class AttendanceRepository
 */
export class AttendanceRepository implements Pick<AttendancePorts, 'getAttendance'>
{
  /**
   * Obtiene las asistencias del usuario
   * @returns {Promise<AttendanceEntity | null>} Asistencias del usuario o null si no existe
   */
  async getAttendance(): Promise<AttendanceEntity | null> {
    //console.log('aqui getAttendance')
    const authStateController = useMemo(() => new AuthStateController(), [])
    const dateToGet = DateTime.now().setLocale('es').toISODate()
    const dateEnd = DateTime.now().setLocale('es').toISODate()
    
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
    
    const response = await axios.get(`${environment.API_URL}/v1/assists?date=${dateToGet}&date-end=${dateEnd}&employeeId=${employeeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.status !== 200) {
      throw new Error('Error fetching shift data')
    }

    //const responseData = response.data.data.employeeCalendar[0].assist
    //const shiftInfo: string = responseData?.dateShift?.shiftName || '---'
    //console.log(responseData)
    return null
  }
}
