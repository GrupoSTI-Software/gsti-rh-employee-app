import useAttendanceCheckStyle from '../attendance-check.style'
import { getStatusColor } from './get-status-color.util'

/**
 * Función para obtener estilos de indicador según el estatus
 * @param {string | null} status - Estatus del registro
 * @param {boolean} hasTime - Si tiene tiempo
 * @returns estilos de indicador según el estatus
 */
export const getIndicatorStyles = 
  (status: string | null, hasTime: boolean) => {
    const styles = useAttendanceCheckStyle()
    const statusColor = getStatusColor(status)
    const baseStyles = [
      styles.indicator,
      hasTime && styles.indicatorActive
    ]
    
    if (statusColor) {
      return [
        ...baseStyles,
        { borderLeftColor: statusColor, borderLeftWidth: 4 }
      ]
    }
    
    return baseStyles
  }
