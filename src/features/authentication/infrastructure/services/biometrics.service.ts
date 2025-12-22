import * as LocalAuthentication from '../../../../shared/infrastructure/platform/local-authentication.web'
import i18next from 'i18next'

/**
 * Interfaz para los tipos de biometría disponibles
 * @interface IAvailableBiometricTypes
 */
export interface IAvailableBiometricTypes {
  /**
   * Indica si el dispositivo soporta autenticación por huella digital
   * @type {boolean}
   */
  supportsFingerprint: boolean

  /**
   * Indica si el dispositivo soporta autenticación por Face ID
   * @type {boolean}
   */
  supportsFaceID: boolean

  /**
   * Indica si la huella digital está realmente registrada y disponible para uso
   * @type {boolean}
   */
  hasEnrolledFingerprint: boolean

  /**
   * Indica si Face ID está realmente registrado y disponible para uso
   * @type {boolean}
   */
  hasEnrolledFaceID: boolean

  /**
   * El tipo principal de biometría que está registrado en el dispositivo (si lo hay)
   * @type {'face' | 'fingerprint' | undefined}
   */
  primaryBiometricType?: 'face' | 'fingerprint'
}

/**
 * Servicio para gestionar la autenticación biométrica
 * @class BiometricsService
 */
export class BiometricsService {
  /**
   * Verifica si la autenticación biométrica está disponible en el dispositivo
   * @returns {Promise<boolean>} Promesa que resuelve a true si la autenticación biométrica está disponible
   */
  async isBiometricAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync()
    const enrolled = await LocalAuthentication.isEnrolledAsync()
    return compatible && enrolled
  }

  /**
   * Obtiene los tipos de biometría disponibles en el dispositivo
   * @returns {Promise<IAvailableBiometricTypes>} Promesa que resuelve a un objeto con los tipos de biometría disponibles
   */
  async getAvailableBiometricTypes(): Promise<IAvailableBiometricTypes> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync()
      
      if (!compatible) {
        return {
          supportsFingerprint: false,
          supportsFaceID: false,
          hasEnrolledFingerprint: false,
          hasEnrolledFaceID: false
        }
      }
      
      // Verificar capacidades de hardware
      const availableTypes = await LocalAuthentication.supportedAuthenticationTypesAsync()
      const supportsFingerprint = availableTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
      const supportsFaceID = availableTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
      
      // Verificar si algún método biométrico está registrado
      const hasEnrolledBiometrics = await LocalAuthentication.isEnrolledAsync()
      
      // Obtener nivel de seguridad para determinar qué biometría está realmente registrada
      // Este es un enfoque de mejor esfuerzo ya que expo-local-authentication no proporciona
      // una API directa para verificar biométricos específicos registrados
      let hasEnrolledFingerprint = false
      let hasEnrolledFaceID = false
      let primaryBiometricType: 'face' | 'fingerprint' | undefined = undefined
      
      if (hasEnrolledBiometrics) {
        if (supportsFingerprint && supportsFaceID) {
          // Si el dispositivo soporta ambos, verificar cuál está realmente registrado
          try {
            // Intentar determinar qué biometría está registrada según el hardware
            const level = await LocalAuthentication.getEnrolledLevelAsync()
            
            if (level === LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG) {
              // Biometría fuerte típicamente indica que Face ID está registrado
              hasEnrolledFaceID = true
              primaryBiometricType = 'face'
            } else if (level === LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK) {
              // Biometría débil típicamente indica que la huella digital está registrada
              hasEnrolledFingerprint = true
              primaryBiometricType = 'fingerprint'
            } else {
              // Si no podemos determinar, asumimos que ambos están disponibles si el dispositivo tiene ambos
              hasEnrolledFingerprint = supportsFingerprint
              hasEnrolledFaceID = supportsFaceID
              
              // Por defecto, usamos face si está disponible, de lo contrario fingerprint
              primaryBiometricType = supportsFaceID ? 'face' : 'fingerprint'
            }
          } catch (error) {
            // Si hay un error al obtener el nivel de seguridad, recurrimos a las capacidades de hardware
            // Esta es una suposición menos precisa, pero es lo mejor que podemos hacer
            console.error('Error al obtener nivel de seguridad:', error)
            hasEnrolledFingerprint = supportsFingerprint
            hasEnrolledFaceID = supportsFaceID
            
            // Por defecto, usamos face si está disponible, de lo contrario fingerprint
            primaryBiometricType = supportsFaceID ? 'face' : 'fingerprint'
          }
        } else {
          // Si el dispositivo solo soporta un tipo, ese debe ser el que está registrado
          hasEnrolledFingerprint = supportsFingerprint && hasEnrolledBiometrics
          hasEnrolledFaceID = supportsFaceID && hasEnrolledBiometrics
          
          // Establecer el tipo principal de biometría basado en lo que está soportado
          if (supportsFaceID) {
            primaryBiometricType = 'face'
          } else if (supportsFingerprint) {
            primaryBiometricType = 'fingerprint'
          }
        }
      }
      
      return {
        supportsFingerprint,
        supportsFaceID,
        hasEnrolledFingerprint,
        hasEnrolledFaceID,
        primaryBiometricType
      }
    } catch (error) {
      console.error('Error al obtener tipos de biometría disponibles:', error)
      return {
        supportsFingerprint: false,
        supportsFaceID: false,
        hasEnrolledFingerprint: false,
        hasEnrolledFaceID: false
      }
    }
  }

  /**
   * Realiza la autenticación biométrica
   * - Muestra un mensaje de autenticación biométrica
   * - Muestra un mensaje de error en caso de que la autenticación biométrica falle
   * @param {('face'|'fingerprint')} [biometricType] - El tipo de biometría a utilizar (para propósitos de mensaje)
   * @returns {Promise<boolean>} Promesa que resuelve a true si la autenticación fue exitosa
   */
  async authenticate(): Promise<boolean> {
    try {
      // Establecer mensaje apropiado basado en el tipo principal de biometría
      const promptMessage = i18next.t('common.authentication.biometricPromptMessage')
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: i18next.t('common.authentication.biometricFallbackLabel'),
        disableDeviceFallback: false // Permitir PIN del dispositivo como respaldo
      })

      return result.success
    } catch (error) {
      console.error(error)
      throw new Error(i18next.t('errors.biometricAuthenticationError'))
    }
  }
}
