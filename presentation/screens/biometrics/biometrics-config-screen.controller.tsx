import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Platform } from 'react-native'
import { RootStackParamList } from '../../../navigation/types/types'
import { AuthenticationEntity } from '../../../src/features/authentication/domain/entities/authentication-entity'
import { IBiometricsPreferences } from '../../../src/features/authentication/domain/types/authentication.interface'
import { AuthStateController } from '../../../src/features/authentication/infrastructure/controllers/auth-state.controller'
import { AuthenticationLocalStorageService } from '../../../src/features/authentication/infrastructure/services/authentication-local-storage.service'
import { BiometricsService } from '../../../src/features/authentication/infrastructure/services/biometrics.service'
import { getBiometricText } from './utils/get-biometric-text'

/**
 * Controlador para la pantalla de configuración de biometría
 * @returns {Object} Objeto con los datos y funciones accesibles desde la pantalla de configuración de biometría
 */
const BiometricsConfigScreenController = () => {
  const [loading, setLoading] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face'>('fingerprint')

  const [deviceBiometricSupport, setDeviceBiometricSupport] = useState(false)
  const [biometricsEnabled, setBiometricsEnabled] = useState(false)
  
  // Indicadores de soporte de hardware
  const [deviceSupportsFace, setDeviceSupportsFace] = useState(false)
  const [deviceSupportsFingerprint, setDeviceSupportsFingerprint] = useState(false)
  
  // Indicadores de registro (biometría realmente configurada en el dispositivo)
  const [hasEnrolledFaceID, setHasEnrolledFaceID] = useState(false)
  const [hasEnrolledFingerprint, setHasEnrolledFingerprint] = useState(false)
  
  const { t } = useTranslation()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  useEffect(() => {
    checkBiometricAvailability().catch(console.error)
  }, [])

  /**
   * Verifica si los biométricos están disponibles en el dispositivo
   * @returns {Promise<void>}
   */
  const checkBiometricAvailability = async (): Promise<void> => {
    try {
      const biometricService = new BiometricsService()
      const deviceBiometrics = await biometricService.getAvailableBiometricTypes()
      
      // Establecer indicadores de soporte de hardware
      setDeviceSupportsFace(deviceBiometrics.supportsFaceID)
      setDeviceSupportsFingerprint(deviceBiometrics.supportsFingerprint)
      setDeviceBiometricSupport(deviceBiometrics.supportsFaceID || deviceBiometrics.supportsFingerprint)
      
      // Verificar si hay biométricos registrados
      const isBiometricAvailable = await biometricService.isBiometricAvailable()
      setBiometricAvailable(isBiometricAvailable)
      
      // Si no hay biométricos disponibles, no necesitamos continuar
      if (!isBiometricAvailable) {
        return
      }
      
      // Una mejor detección basada en la plataforma
      if (Platform.OS === 'ios') {
        // En iOS, podemos hacer mejores suposiciones sobre qué está disponible
        const isiPhoneX = Platform.OS === 'ios' && 
                          !Platform.isPad && 
                          !Platform.isTV && 
                          ((Platform.constants.reactNativeVersion.minor >= 50) || 
                           (Platform.constants.reactNativeVersion.minor >= 0 && 
                            Platform.constants.reactNativeVersion.major >= 0.6))
        
        if (isiPhoneX) {
          // iPhone X o posterior probablemente usa Face ID
          setHasEnrolledFaceID(true)
          setHasEnrolledFingerprint(false)
          setBiometricType('face')
        } else {
          // iPhone más antiguo probablemente usa Touch ID
          setHasEnrolledFaceID(false)
          setHasEnrolledFingerprint(true)
          setBiometricType('fingerprint')
        }
      } else {
        // En Android, asumimos que es fingerprint ya que es lo más común
        setHasEnrolledFaceID(false)
        setHasEnrolledFingerprint(true)
        setBiometricType('fingerprint')
      }

      // Verificar si la biometría está habilitada en el estado de autenticación
      await checkBiometricsEnabled()
    } catch (error) {
      console.error(t('errors.biometricsNotAvailable'), error)
      setBiometricAvailable(false)
    }
  }

  /**
   * Habilita los biométricos para el usuario
   * @returns {Promise<void>}
   */
  const enableBiometrics = async (): Promise<void> => {
    setLoading(true)
    
    try {
      const biometricService = new BiometricsService()
      
      // Verificar si los biométricos están disponibles
      if (!biometricAvailable) {
        Alert.alert(
          t('common.error'),
          t('errors.biometricsNotAvailable')
        )
        return
      }
      
      // Autenticar con biometría para confirmar la configuración
      // Pasar el tipo de biometría detectado para usar el mensaje apropiado
      const authenticated = await biometricService.authenticate()
      
      if (authenticated) {
        // Actualizar preferencias de usuario
        await updateBiometricsPreferences(true)
        
        // Navegar a la pantalla de control de asistencia
        // navigation.replace('attendanceCheck')
      } else {
        Alert.alert(
          t('common.error'),
          t('errors.biometricAuthenticationFailed')
        )
      }
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('errors.unknownError')
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * Omite la configuración de biometría y navega a la pantalla de control de asistencia
   * @returns {Promise<void>}
   */
  const skipBiometricsSetup = async (): Promise<void> => {
    setLoading(true)
    
    try {
      // Actualizar preferencias de usuario para marcar que se ha mostrado el mensaje pero no se ha habilitado
      await updateBiometricsPreferences(false)
      
      // Navegar a la pantalla de control de asistencia
      navigation.replace('settingsScreen')
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('errors.unknownError')
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * Actualiza las preferencias de biometría del usuario
   * @param {boolean} isEnabled - Si los biométricos deben estar habilitados
   * @returns {Promise<void>}
   */
  const updateBiometricsPreferences = async (isEnabled: boolean): Promise<void> => {
    const authStateController = new AuthStateController()
    const authState = await authStateController.getAuthState()
    
    if (!authState) {
      throw new Error(t('errors.authStateNotFound'))
    }
    
    // Crear preferencias de biometría
    const biometricsPreferences: IBiometricsPreferences = {
      isConfigured: true,
      isEnabled,
      hasPromptBeenShown: true
    }
    
    // Crear entidad de autenticación actualizada
    const updatedAuth = new AuthenticationEntity({
      ...authState.props,
      biometricsPreferences
    })
    
    // Almacenar preferencias actualizadas
    const storageService = new AuthenticationLocalStorageService()
    await storageService.localStoreAuthenticationState(updatedAuth)
    await setBiometricsEnabled(isEnabled)
  }

  /**
   * Verifica si la biometría está habilitada en el estado de autenticación
   * @returns {Promise<void>}
   */
  const checkBiometricsEnabled = async (): Promise<void> => {
    const authStateController = new AuthStateController()
    const authState = await authStateController.getAuthState()
    const isEnabled = authState?.props.biometricsPreferences?.isEnabled
    await setBiometricsEnabled(isEnabled ?? false)
  }

  /**
   * Deshabilita la biometría en el estado de autenticación
   * @returns {Promise<void>}
   */
  const unsetBiometrics = async (): Promise<void> => {
    setLoading(true)
    const authStateController = new AuthStateController()
    const authState = await authStateController.getAuthState()
    const isEnabled = authState?.props.biometricsPreferences?.isEnabled
    await updateBiometricsPreferences(!isEnabled)
    setLoading(false)
  }

  const biometricTextInfo = getBiometricText(t, hasEnrolledFaceID, hasEnrolledFingerprint, biometricType)

  return {
    loading,
    biometricType,
    biometricAvailable,
    biometricsEnabled,
    deviceBiometricSupport,
    // Soporte de hardware
    deviceSupportsFace,
    deviceSupportsFingerprint,
    // Biométricos registrados
    hasEnrolledFaceID,
    hasEnrolledFingerprint,
    // Acciones
    enableBiometrics,
    skipBiometricsSetup,
    biometricTextInfo,
    unsetBiometrics
  }
}

export { BiometricsConfigScreenController }
