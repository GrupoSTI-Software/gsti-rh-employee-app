import useAttendanceCheckStyle from '../attendance-check.style'
import { getStatusColor } from './get-status-color.util'

/**
 * Función para obtener estilos de label según el estatus
 * @param {string | null} status - Estatus del registro
 * @param {boolean} hasTime - Si tiene tiempo
 * @returns estilos de label segun el estatus
 */
export const getLabelStyles = 
  (status: string | null, hasTime: boolean) => {
    const styles = useAttendanceCheckStyle()
    const statusColor = getStatusColor(status)
    const baseStyles = [
      styles.indicatorLabel,
      hasTime && styles.indicatorLabelActive
    ]
    
    if (statusColor) {
      return [...baseStyles, { color: statusColor }]
    }
    
    return baseStyles.filter(Boolean)
  }
