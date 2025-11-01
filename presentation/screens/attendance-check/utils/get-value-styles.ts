import useAttendanceCheckStyle from '../attendance-check.style'
import { getStatusColor } from './get-status-color.util'

/**
 * Función para obtener estilos de valor según el estatus
 * @param {string | null} status - Estatus del registro
 * @param {boolean} hasTime - Si tiene tiempo
 * @returns estilos de valor según el estatus
 */
export const getValueStyles = 
  (status: string | null, hasTime: boolean) => {
    const styles = useAttendanceCheckStyle()
    const statusColor = getStatusColor(status)
    const baseStyles = [
      styles.indicatorValue,
      hasTime && styles.indicatorValueActive
    ]
    
    if (statusColor) {
      return [...baseStyles, { color: statusColor }]
    }
    
    return baseStyles.filter(Boolean)
  }
