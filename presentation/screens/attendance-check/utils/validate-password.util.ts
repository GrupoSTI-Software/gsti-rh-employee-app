import { TFunction } from 'i18next'
import { PasswordPromptService } from '../../../../src/features/authentication/infrastructure/services/password-prompt.service'

/**
 * Expone validatePassword para la pantalla
 * @param {string} password - Contraseña a validar
 * @returns {Promise<string | null>} Mensaje de error o null si la contraseña es válida
 */
export const validatePassword = async (password: string, t: TFunction<'translation', undefined>): Promise<string | null> => {
  try {
    const passwordService = new PasswordPromptService()
    await passwordService.validatePassword(password)

    return null
  } catch (error) {
    return error instanceof Error ? error.message : t('errors.invalidPassword')
  }
}
