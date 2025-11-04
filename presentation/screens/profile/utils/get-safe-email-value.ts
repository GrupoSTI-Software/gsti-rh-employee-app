import { EmailVO } from '../../../../src/shared/domain/value-objects/email.vo'

/**
 * Obtiene un valor seguro de email
 * @param {EmailVO | null | undefined} email - Email a verificar
 * @returns {string} Valor del email o "---" si está vacío
*/
export const getSafeEmailValue = (email: EmailVO | null | undefined): string => {
  return email?.value && email.value.trim() !== '' ? email.value : '---'
}
