import useAttendanceCheckStyle from '../attendance-check.style'

/**
 * Función para obtener el color del icono según el estatus
 * @param {string | null} status - Estatus del registro
 * @returns el color del icono según el estatus
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getIconColor = (status: string | null) => {
  const styles = useAttendanceCheckStyle()
  // Mismo color que el texto
  return styles.checkIconIndicator.color
}
