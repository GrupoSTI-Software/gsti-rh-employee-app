/**
* Obtiene el color según el estatus
* @param {string | null} status - Estatus del registro
* @returns {string} Color correspondiente al estatus
*/
export const getStatusColor = (status: string | null): string => {
  switch (status) {
  case 'ontime':
    return '#10B981' // Verde
  case 'delay':
    return '#F59E0B' // Naranja
  case 'tolerance':
    return '#3B82F6' // Azul
  case 'fault':
    return '#EF4444' // Rojo
  default:
    return '' // Color actual/default
  }
}

