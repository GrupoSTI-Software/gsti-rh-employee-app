/**
 * Obtiene un valor seguro con fallback a "---"
 * @param {string | null | undefined} value - Valor a verificar
 * @returns {string} Valor o "---" si está vacío
*/
export const getSafeValue = (value: string | null | undefined): string => {
  return value && value.trim() !== '' ? value : '---'
}
