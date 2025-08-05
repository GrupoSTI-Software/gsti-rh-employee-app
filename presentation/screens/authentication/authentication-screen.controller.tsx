/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { environment } from '../../../config/environment'
import { RootStackParamList } from '../../../navigation/types/types'
import { ELoginTypes } from '../../../src/features/authentication/application/types/login-types.enum'
import { AuthStateController } from '../../../src/features/authentication/infrastructure/controllers/auth-state.controller'
import { LoginController } from '../../../src/features/authentication/infrastructure/controllers/login.controller'
import { BiometricsService } from '../../../src/features/authentication/infrastructure/services/biometrics.service'
import { ILocationCoordinates, LocationService } from '../../../src/features/authentication/infrastructure/services/location.service'

// import Constants from 'expo-constants'

/**
 * Controlador de la pantalla de autenticación
 * @returns {Object} Objeto con los datos y funciones accesibles desde la pantalla de autenticación
 */
const AuthenticationScreenController = () => {
  const [loginButtonLoading, setLoginButtonLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('wramirez@siler-mx.com')
  const [password, setPassword] = useState('xab@ubm0qyn0BPK5cpj')
  // const [email, setEmail] = useState('')
  // const [password, setPassword] = useState('')
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false)
  const [securityAlert, setSecurityAlert] = useState<string | null>(null)
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face'>('fingerprint')
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [hasBiometricsPromptBeenShown, setHasBiometricsPromptBeenShown] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<ILocationCoordinates | null>(null)
  const [settedAPIUrl, setSettedAPIUrl] = useState<string>('')

  const { t } = useTranslation()
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  useEffect(() => {
    initializeApp().catch(console.error)
  })

  /**
   * Inicializa la aplicación
   * - Inicializa la biometría y los datos de usuario en caso de que existan
   * @returns {Promise<void>}
   */
  const initializeApp = async () => {
    try {
      await initUserData()
    } catch (error) {
      console.error('Error al inicializar la aplicación:', error)
    }
  }

  /**
   * Inicializa los datos de usuario en caso de que exista una sesión local almacenada
   * @returns {Promise<void>}
   */
  const initUserData = async () => {
    setSettedAPIUrl(environment.SAE_EMPLOYEEAPP_API_URL || 'NOT ASSIGNED')
    await Promise.all([initBiometricAvailability(), setAuthStateData()])
  }

  /**
   * Maneja el inicio de sesión
   * @param {string} type - Tipo de autenticación
   * - 'email' para autenticación con correo electrónico y contraseña
   * - 'biometric' para autenticación con biometría
   * @returns {Promise<void>}
   */
  const loginHandler = async (type: 'email' | 'biometric') => {
    if (loginButtonLoading) return
    setLoginButtonLoading(true)

    try {
      // Validar ubicación precisa antes del login
      const locationService = new LocationService()
      
      try {
        const coordinates = await locationService.getValidatedLocation(30) // Precisión de 30 metros - recomendado para asistencia laboral
        setCurrentLocation(coordinates)
      } catch (locationError) {
        Alert.alert(
          t('common.error'),
          locationError instanceof Error 
            ? locationError.message 
            : t('errors.locationRequired')
        )
        return
      }

      const authLoginController = new LoginController()

      await authLoginController.login({
        email,
        password,
        type: type as ELoginTypes
      })

      await setAuthStateData()

      const biometricService = new BiometricsService()
      const isBiometricAvailable = await biometricService.isBiometricAvailable()
      
      if (type === 'email' && isBiometricAvailable && !hasBiometricsPromptBeenShown) {
        navigation.replace('biometricsConfigScreen')
      } else {
        navigation.replace('attendanceCheck')
      }
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('errors.unknownError')
      )
    } finally {
      setTimeout(() => {
        setLoginButtonLoading(false)
      }, 200)
    }
  }

  /**
   * Establece los datos de autenticación en el estado de la aplicación
   * - Si existen credenciales almacenadas, se establecen en el estado de la aplicación
   * @returns {Promise<void>}
   */
  const setAuthStateData = async (): Promise<void> => {
    try {
      const authStateController = new AuthStateController()
      const authState = await authStateController.getAuthState()
      const hasPromptBeenShown = hasBiometricsPromptBeenShown || authState?.props.biometricsPreferences?.hasPromptBeenShown

      setHasBiometricsPromptBeenShown(hasPromptBeenShown || false)

      if (!authState || !authState.props.authState?.user?.props) {
        return
      }

      if (authState.props.authState?.user?.props.person) {
        setUserName(authState.props.authState.user.props.person.props.firstname || '')
      }

      setHasStoredCredentials(!!authState?.props.authState?.user?.props)
      setEmail(authState?.props.loginCredentials?.email || '')
      
      // Set biometric enabled state from preferences
      setBiometricEnabled(!!authState?.props.biometricsPreferences?.isEnabled)
      return
    } catch (error) {
      throw new Error(t('errors.authenticationGetStorageError'))
    }
  }

  /**
   * Maneja el cambio de correo electrónico en el input de la UI
   * @param {string} email - Correo electrónico a establecer
   * @returns {void}
   */
  const handleEmailChange = (email: string) => {
    setEmail(email.toLocaleLowerCase())
  }

  /**
   * Maneja el cambio de contraseña en el input de la UI
   * @param {string} password - Contraseña a establecer
   * @returns {void}
   */
  const handlePasswordChange = (password: string) => {
    setPassword(password)
  }

  /**
   * Obtiene el título de bienvenida
   * - Si existen credenciales almacenadas, se establece el título de bienvenida con el nombre del usuario
   * - Si no existen credenciales almacenadas, se establece el título de bienvenida con el título de la pantalla de inicio de sesión
   * @returns {string} Título de bienvenida
   */
  const getWelcomeTitle = () => {
    try {
      return hasStoredCredentials && userName
        ? t('screens.authentication.welcome', { name: userName })
        : t('screens.authentication.title')
    } catch (error) {
      return t('screens.authentication.title')
    }
  }

  /**
   * Determina si se deben mostrar los biométricos
   * - valida la disponibilidad de la biometria en el dispositivo
   * - valida la existencia de credenciales almacenadas localmente
   * - valida que los biométricos estén habilitados en las preferencias del usuario
   * @returns {boolean} True si se deben mostrar los biométricos, false en caso contrario
   */
  const shouldShowBiometrics = () => {
    try {
      return Boolean(biometricAvailable) && Boolean(hasStoredCredentials) && Boolean(biometricEnabled)
    } catch (error) {
      console.error('Error al evaluar biométricos:', error)
      return false
    }
  }

  /**
   * Obtiene la disponibilidad de la biometría del dispositivo
   * @returns {Promise<void>}
   */
  const initBiometricAvailability = async (): Promise<void> => {
    const biometricService = new BiometricsService()
    const isBiometricAvailable = await biometricService.isBiometricAvailable()
    setBiometricAvailable(isBiometricAvailable)
  }

  /**
   * Obtiene las coordenadas actuales del dispositivo
   * @returns {Promise<ILocationCoordinates | null>} Coordenadas actuales o null si hay error
   */
  const getCurrentLocationCoordinates = async (): Promise<ILocationCoordinates | null> => {
    try {
      const locationService = new LocationService()
      const coordinates = await locationService.getValidatedLocation(30) // Precisión de 30 metros - recomendado para asistencia laboral
      setCurrentLocation(coordinates)
      return coordinates
    } catch (error) {
      console.error('Error al obtener coordenadas:', error)
      return null
    }
  }

  return {
    email,
    password,
    loginButtonLoading,
    biometricType,
    securityAlert,
    currentLocation,
    setSecurityAlert,
    loginHandler,
    setEmail: handleEmailChange,
    setPassword: handlePasswordChange,
    getWelcomeTitle,
    shouldShowBiometrics,
    getCurrentLocationCoordinates,
    settedAPIUrl
  }
}

export { AuthenticationScreenController }
