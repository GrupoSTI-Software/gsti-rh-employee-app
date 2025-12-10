import axios from 'axios'
import { DateTime } from 'luxon'
import { getApi } from '../../../../../../presentation/utils/get-api-url'
import { AuthStateController } from '../../../../authentication/infrastructure/controllers/auth-state.controller'
import { AttendanceEntity } from '../../../domain/entities/attendance-entity'
import { AttendancePorts } from '../../../domain/ports/attendance.ports.js'


/**
 * Repositorio que implementa la comunicación con la API para obtener las asistencias del usuario
 * @class AttendanceRepository
 */
export class AttendanceRepository implements Pick<AttendancePorts, 'getAttendance'>
{
  /**
   * Obtiene las asistencias del usuario
   * @param {string} dateStart - Fecha inicial
   * @param {string} dateEnd - Fecha final
   * @returns {Promise<AttendanceEntity | null>} Asistencias del usuario o null si no existe
   */
  async getAttendance(dateStart: string, dateEnd: string): Promise<AttendanceEntity | null> {
    const apiUrl = await getApi()
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
    const response = await axios.get(`${apiUrl}/v1/assists?date=${dateStart}&date-end=${dateEnd}&employeeId=${employeeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.status !== 200) {
      throw new Error('Error fetching shift data')
    }

    const formatTime = (dateString: string | null): string | null => {
      if (!dateString) return null
      try {
        return DateTime.fromISO(dateString).setZone('UTC-6').setLocale('es').toFormat('HH:mm:ss')
      } catch {
        return null
      }
    }
    const responseData = response.data.data.employeeCalendar[0].assist
    const shiftInfo: string = responseData?.dateShift?.shiftName || '---'
    const hasException =
      responseData.isRestDay ||
      responseData.isWorkDisabilityDate ||
      responseData.isVacationDate ||
      responseData.isHoliday

    const attendanceEntity = new AttendanceEntity({
      checkInTime: formatTime(responseData?.checkIn?.assistPunchTimeUtc as string | null),
      checkOutTime: formatTime(responseData?.checkOut?.assistPunchTimeUtc as string | null),
      checkEatInTime: formatTime(responseData?.checkEatIn?.assistPunchTimeUtc as string | null),
      checkEatOutTime: formatTime(responseData?.checkEatOut?.assistPunchTimeUtc as string | null),

      checkInStatus:
        responseData?.checkInStatus === 'fault' && hasException
          ? ''
          : (responseData?.checkInStatus as string) || null,

      checkOutStatus:
        responseData?.checkOutStatus === 'fault' && hasException
          ? ''
          : (responseData?.checkOutStatus as string) || null,

      checkEatInStatus: (responseData?.checkEatInStatus as string) || null,
      checkEatOutStatus: (responseData?.checkEatOutStatus as string) || null,

      shiftInfo: shiftInfo,

      isRestDay: responseData.isRestDay,
      isWorkDisabilityDate: responseData.isWorkDisabilityDate,
      isVacationDate: responseData.isVacationDate,
      isHoliday: responseData.isHoliday,
      assitFlatList: responseData.assitFlatList
    })

    
    return attendanceEntity
  }
}
