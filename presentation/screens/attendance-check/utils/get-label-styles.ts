import useAttendanceCheckStyle from '../attendance-check.style'

/**
 * Función para obtener estilos de label según el estatus
 * @param {string | null} status - Estatus del registro
 * @param {boolean} hasTime - Si tiene tiempo
 * @returns estilos de label segun el estatus
 */
export const getLabelStyles = 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (status: string | null, hasTime: boolean) => {
    const styles = useAttendanceCheckStyle()
    // De momento todos con el mismo estilo base (gris)
    return [styles.indicatorLabel]
  }
