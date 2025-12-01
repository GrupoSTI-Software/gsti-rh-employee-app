import useAttendanceCheckStyle from '../attendance-check.style'
import { getStatusColor } from './get-status-color.util'

/**
 * Función para obtener el color del icono según el estatus
 * @param {string | null} status - Estatus del registro
 * @returns el color del icono según el estatus
 */
export const getIconColor = (status: string | null) => {
  const styles = useAttendanceCheckStyle()
  const statusColor = getStatusColor(status)
  return statusColor || styles.checkIconIndicator.color
}
