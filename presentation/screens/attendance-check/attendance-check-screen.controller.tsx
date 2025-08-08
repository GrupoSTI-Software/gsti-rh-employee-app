import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import axios, { AxiosError } from 'axios'
import { DateTime } from 'luxon'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Linking, Platform } from 'react-native'
import { environment } from '../../../config/environment'
import { RootStackParamList } from '../../../navigation/types/types'
import { AuthStateController } from '../../../src/features/authentication/infrastructure/controllers/auth-state.controller'
import { ClearSessionController } from '../../../src/features/authentication/infrastructure/controllers/clear-seassion.controller'
import { BiometricsService } from '../../../src/features/authentication/infrastructure/services/biometrics.service'
import { ILocationCoordinates, LocationService } from '../../../src/features/authentication/infrastructure/services/location.service'
import { PasswordPromptService } from '../../../src/features/authentication/infrastructure/services/password-prompt.service'
import { useAppTheme } from '../../theme/theme-context'


// Agregar interfaces para tipado
interface IAttendanceData {
  checkInTime: string | null
  checkOutTime: string | null
  checkEatInTime: string | null
  checkEatOutTime: string | null
  checkInStatus: string | null
  checkOutStatus: string | null
  checkEatInStatus: string | null
  checkEatOutStatus: string | null
}

/**
 * Controlador para la pantalla de registro de asistencia
 * @returns {Object} Objeto con los datos y funciones accesibles desde la pantalla de registro de asistencia
 */
const AttendanceCheckScreenController = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [isButtonLocked, setIsButtonLocked] = useState(false)
  // const [checkInTime, setCheckInTime] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<ILocationCoordinates | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const { themeType } = useAppTheme()
  const { t } = useTranslation()
  const [showPasswordDrawer, setShowPasswordDrawer] = useState(false)
  const [onPasswordSuccess, setOnPasswordSuccess] = useState<(() => void) | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const bottomSheetRef = useRef<BottomSheet>(null)
  const [password, setPassword] = useState('')
  const [shiftDate, setShiftDate] = useState<string | null>(null)
  const [attendanceData, setAttendanceData] = useState<IAttendanceData>({
    checkInTime: null,
    checkOutTime: null,
    checkEatInTime: null,
    checkEatOutTime: null,
    checkInStatus: null,
    checkOutStatus: null,
    checkEatInStatus: null,
    checkEatOutStatus: null
  })
  const [shiftEndTime, setShiftEndTime] = useState<string | null>(null)
  const [hasConnectionError, setHasConnectionError] = useState<boolean>(false)
  const [isRetrying, setIsRetrying] = useState<boolean>(false)
  
  // Pre-instanciar servicios para mejor rendimiento
  const authStateController = useMemo(() => new AuthStateController(), [])
  const biometricService = useMemo(() => new BiometricsService(), [])
  const locationService = useMemo(() => new LocationService(), [])
  const passwordService = useMemo(() => new PasswordPromptService(), [])
  const clearSessionController = useMemo(() => new ClearSessionController(), [])
  
  // Memorizar snapPoints para evitar recreaciones
  const snapPoints = useMemo(() => ['65%'], [])

  // Definir setShiftDateData antes de usarlo en useEffect
  const setShiftDateData = useCallback(async (): Promise<string> => {
    try {
      const dateToGet = DateTime.now().setLocale('es').toISODate()
      const dateEnd = DateTime.now().setLocale('es').toISODate()
      
      // Obtener el token de autenticación
      const authState = await authStateController.getAuthState()
      const token = authState?.props.authState?.token
      
      if (!token) {
        throw new Error('Token de autenticación no encontrado')
      }
      
      if (!token) {
        throw new Error('Token de autenticación no encontrado')
      }

      const employeeId = authState?.props.authState?.user?.props.person?.props.employee?.props?.id?.value || null
      
      const response = await axios.get(`${environment.API_URL}/v1/assists?date=${dateToGet}&date-end=${dateEnd}&employeeId=${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status !== 200) {
        throw new Error('Error fetching shift data')
      }

      const responseData = response.data.data.employeeCalendar[0].assist
      const shiftInfo: string = responseData?.dateShift?.shiftName || '---'

      // Éxito: limpiar error de conexión
      setHasConnectionError(false)
      setShiftDate(shiftInfo)

      // Extraer hora de salida del turno del shiftName
      const extractEndTime = (shiftName: string): string | null => {
        try {
          const match = shiftName.match(/(\d{2}:\d{2})\s+to\s+(\d{2}:\d{2})/)
          return match ? match[2] : null
        } catch {
          return null
        }
      }

      const endTime = extractEndTime(shiftInfo)
      setShiftEndTime(endTime)

      // Extraer datos de asistencia
      const formatTime = (dateString: string | null): string | null => {
        if (!dateString) return null
        try {
          return DateTime.fromISO(dateString).setZone('UTC-6').setLocale('es').toFormat('HH:mm:ss')
        } catch {
          return null
        }
      }

      const newAttendanceData: IAttendanceData = {
        checkInTime: formatTime(responseData?.checkIn?.assistPunchTimeUtc as string | null),
        checkOutTime: formatTime(responseData?.checkOut?.assistPunchTimeUtc as string | null),
        checkEatInTime: formatTime(responseData?.checkEatIn?.assistPunchTimeUtc as string | null),
        checkEatOutTime: formatTime(responseData?.checkEatOut?.assistPunchTimeUtc as string | null),
        checkInStatus: (responseData?.checkInStatus as string) || null,
        checkOutStatus: (responseData?.checkOutStatus as string) || null,
        checkEatInStatus: (responseData?.checkEatInStatus as string) || null,
        checkEatOutStatus: (responseData?.checkEatOutStatus as string) || null
      }

      setAttendanceData(newAttendanceData)

      return shiftInfo
    } catch (error) {
      console.error('Error fetching shift data:', error)
      
      // Verificar si es error 401 (Unauthorized)
      if (error instanceof AxiosError && error.response?.status === 401) {
        try {
          // Cerrar sesión y limpiar datos de autenticación
          await clearSessionController.clearSession()
          Alert.alert(
            t('screens.attendanceCheck.sessionExpired.title'),
            t('screens.attendanceCheck.sessionExpired.message'),
            [
              {
                text: t('common.ok'),
                onPress: () => {
                  navigation.replace('authenticationScreen')
                }
              }
            ]
          )
          return '---' // Valor por defecto en caso de sesión expirada
        } catch (clearError) {
          console.error('Error clearing session:', clearError)
        }
      }
      
      // Marcar error de conexión
      setHasConnectionError(true)
      
      // Fallback en caso de error
      const fallbackDate = '08:00 to 17:00 - Rest (Sat, Sun)'
      setShiftDate(fallbackDate)
      
      // Resetear datos de asistencia en caso de error
      setAttendanceData({
        checkInTime: null,
        checkOutTime: null,
        checkEatInTime: null,
        checkEatOutTime: null,
        checkInStatus: null,
        checkOutStatus: null,
        checkEatInStatus: null,
        checkEatOutStatus: null
      })
      setShiftEndTime(null)
      
      return fallbackDate
    }
  }, [])

  // Abrir/cerrar drawer según controller
  useEffect(() => {
    if (showPasswordDrawer) {
      bottomSheetRef.current?.snapToIndex(0)
    } else {
      bottomSheetRef.current?.close()
      setPassword('')
    }
  }, [showPasswordDrawer])

  // Ejecutar la petición al cargar el screen
  useEffect(() => {
    const loadShiftData = async () => {
      try {
        await setShiftDateData()
      } catch (error) {
        console.error('Error loading shift data on screen mount:', error)
      }
    }
    
    void loadShiftData()
  }, [setShiftDateData])

  // Validar contraseña
  const handlePasswordSubmit = useCallback(async () => {
    const error = await validatePassword(password)
    if (!error) {
      onPasswordSuccess?.()
    } else {
      setPasswordError(error)
    }
  }, [password, onPasswordSuccess])

  /**
   * Expone validatePassword para la pantalla
   * @param {string} password - Contraseña a validar
   * @returns {Promise<string | null>} Mensaje de error o null si la contraseña es válida
   */
  const validatePassword = useCallback(async (password: string): Promise<string | null> => {
    try {
      await passwordService.validatePassword(password)
      return null
    } catch (error) {
      return error instanceof Error ? error.message : t('errors.invalidPassword')
    }
  }, [passwordService, t])

  /**
   * Valida la ubicación en segundo plano con configuración optimizada
   * @returns {Promise<ILocationCoordinates>}
   */
  const validateLocationInBackground = useCallback(async (): Promise<ILocationCoordinates> => {
    // Usar configuración más rápida para no bloquear la UX
    return await locationService.getValidatedLocation(50) // Precisión menos estricta: 50m vs 30m
  }, [locationService])

  /**
   * Registra la asistencia mediante petición POST al API
   * @param {number} latitude - Latitud de la ubicación
   * @param {number} longitude - Longitud de la ubicación  
   * @returns {Promise<boolean>} True si la petición fue exitosa
   */
  const registerAttendance = useCallback(async (latitude: number, longitude: number): Promise<boolean> => {
    try {
      // Obtener el token de autenticación y employeeId
      const authState = await authStateController.getAuthState()
      const token = authState?.props.authState?.token
      
      if (!token) {
        throw new Error('Token de autenticación no encontrado')
      }

      const employeeId = authState?.props.authState?.user?.props.person?.props.employee?.props?.id?.value || null

      if (!employeeId) {
        throw new Error('Employee ID no encontrado')
      }

      const payload = {
        employeeId,
        assistLatitude: latitude,
        assistLongitude: longitude
      }

      const response = await axios.post(`${environment.API_URL}/v1/assists`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 201) {
        return true
      } else {
        console.error('Respuesta inesperada del servidor:', response.status)
        return false
      }
    } catch (error) {
      console.error('Error registrando asistencia:', error)
      
      // Si es error 401, manejar sesión expirada
      if (error instanceof AxiosError && error.response?.status === 401) {
        try {
          await clearSessionController.clearSession()
          Alert.alert(
            t('screens.attendanceCheck.sessionExpired.title'),
            t('screens.attendanceCheck.sessionExpired.message'),
            [{ text: t('common.ok') }]
          )
        } catch (clearError) {
          console.error('Error clearing session:', clearError)
        }
      } else {
        // Mostrar error específico al usuario
        const errorMessage = error instanceof AxiosError 
          ? error.response?.data?.message || error.message
          : error instanceof Error 
            ? error.message 
            : 'Error desconocido al registrar asistencia'
        
        Alert.alert(
          t('common.error'),
          `${t('screens.attendanceCheck.registrationError')}: ${errorMessage}`
        )
      }
      return false
    }
  }, [authStateController, clearSessionController, t])

  /**
   * Ejecuta el proceso de check-in después de validar la ubicación
   * @param {ILocationCoordinates} location - Coordenadas validadas de ubicación
   * @returns {Promise<void>}
   */
  const performCheckIn = useCallback(async (location: ILocationCoordinates) => {
    try {
      // Verificar si la biometría está habilitada y disponible
      const authState = await authStateController.getAuthState()
      const biometricsEnabled = authState?.props.biometricsPreferences?.isEnabled ?? false
      
      const isBiometricAvailable = await biometricService.isBiometricAvailable()
      
      let isAuthenticated = false
      
      if (biometricsEnabled && isBiometricAvailable) {
        // Intentar autenticación biométrica primero
        try {
          isAuthenticated = await biometricService.authenticate()
        } catch (biometricError) {
          console.error('Error en autenticación biométrica:', biometricError)
          // Si la biometría falla, continuar con contraseña como fallback
        }
      }
      
      // Si la biometría no está disponible, no está habilitada, o falló, solicitar contraseña
      if (!isAuthenticated) {
        // En vez de pedir contraseña aquí, muestra el drawer y espera
        setShowPasswordDrawer(true)
        // Devuelve una promesa que se resuelve cuando la pantalla valide la contraseña
        await new Promise<void>((resolve) => {
          setOnPasswordSuccess(() => () => {
            setShowPasswordDrawer(false)
            setPasswordError(null)
            resolve()
          })
        })
        isAuthenticated = true
      }
      
      // Si llegamos aquí, la autenticación fue exitosa
      if (isAuthenticated) {
        setIsButtonLocked(true)
        
        // Registrar asistencia en el servidor
        const registrationSuccess = await registerAttendance(location.latitude, location.longitude)
        
        if (registrationSuccess) {
          // Si el registro fue exitoso, actualizar los datos locales
          // setCheckInTime(DateTime.now().setLocale('es').toFormat('HH:mm:ss'))
          
          // Recargar los datos de asistencia desde el servidor
          try {
            await setShiftDateData()
          } catch (reloadError) {
            console.error('Error recargando datos de asistencia:', reloadError)
            // No mostramos error al usuario, ya que el registro fue exitoso
          }
        }

        setTimeout(() => {
          setIsButtonLocked(false)
        }, (2 * 1000))
      }
    } catch (error) {
      console.error('Error en autenticación:', error)
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('errors.unknownError')
      )
    }
  }, [authStateController, biometricService, registerAttendance, setShiftDateData, t])

  /**
   * Maneja el evento de registro de asistencia
   * - Inicia la autenticación inmediatamente para mejor UX
   * - Valida ubicación en paralelo durante la autenticación
   * @returns {Promise<void>}
   */
  const handleCheckIn = useCallback(async () => {    
    if (isButtonLocked || isLoadingLocation) return

    setIsLoadingLocation(true)

    try {
      // Primero validar la ubicación antes de proceder con la autenticación
      const locationResult = await validateLocationInBackground()
      
      // Ubicación validada correctamente, proceder con autenticación
      setCurrentLocation(locationResult)
      
      // Ejecutar el check-in con la ubicación validada
      await performCheckIn(locationResult)

    } catch (error) {
      // Verificar si es error de ubicación
      const errorMessage = error instanceof Error ? error.message : ''
      
      // Verificar si el error es de precisión o autorización
      const isPrecisionError = errorMessage.includes('precisión') || errorMessage.includes('precision') || errorMessage.includes('accuracy')
      const isPermissionError = errorMessage.includes('permission') || errorMessage.includes('autorización') || errorMessage.includes('denied')
      
      if (isPrecisionError || isPermissionError) {
        Alert.alert(
          t('common.warning'),
          `${t('errors.locationValidationWarning')}\n\n${errorMessage}`,
          [
            {
              text: t('common.understood'),
              style: 'default'
            },
            {
              text: t('common.settings'),
              onPress: () => {
                void openLocationSettings()
              }
            }
          ]
        )
      } else {
        Alert.alert(
          t('common.error'),
          error instanceof Error ? error.message : t('errors.unknownError')
        )
      }
    } finally {
      setIsLoadingLocation(false)
    }
  }, [isButtonLocked, isLoadingLocation, t, validateLocationInBackground, performCheckIn])

  /**
   * Formatea las coordenadas para mostrarlas en pantalla
   * @param {ILocationCoordinates} coordinates - Coordenadas a formatear
   * @returns {string} Coordenadas formateadas
   */
  const formatCoordinates = useCallback((coordinates: ILocationCoordinates): string => {
    return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`
  }, [])

  /**
   * Obtiene el texto de precisión formateado
   * @param {ILocationCoordinates} coordinates - Coordenadas con precisión
   * @returns {string} Precisión formateada
   */
  const formatAccuracy = useCallback((coordinates: ILocationCoordinates): string => {
    return `±${coordinates.accuracy.toFixed(1)}m`
  }, [])

  /**
   * Verifica si ya es hora de mostrar los datos de salida
   * @returns {boolean} True si ya es hora de salir o después
   */
  const isCheckOutTimeReached = useCallback((): boolean => {
    if (!shiftEndTime) return true // Si no hay hora definida, mostrar siempre
    
    try {
      const now = DateTime.now().setLocale('es')
      const endTimeToday = DateTime.fromFormat(shiftEndTime, 'HH:mm').set({
        year: now.year,
        month: now.month,
        day: now.day
      })
      
      return now >= endTimeToday
    } catch {
      return true // En caso de error, mostrar siempre
    }
  }, [shiftEndTime])

  /**
   * Obtiene el color según el estatus
   * @param {string | null} status - Estatus del registro
   * @returns {string} Color correspondiente al estatus
   */
  const getStatusColor = useCallback((status: string | null): string => {
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
  }, [])

  /**
   * Abre la configuración de ubicación del dispositivo
   * @returns {Promise<void>}
   */
  const openLocationSettings = useCallback(async (): Promise<void> => {
    try {
      if (Platform.OS === 'ios') {
        // En iOS, abre la configuración general de privacidad y ubicación
        await Linking.openURL('app-settings:')
      } else {
        // En Android, intenta abrir la configuración de ubicación específica
        await Linking.openURL('android.settings.LOCATION_SOURCE_SETTINGS')
      }
    } catch (error) {
      console.error('Error abriendo configuración de ubicación:', error)
      // Si no se puede abrir la configuración específica, abre la configuración general
      try {
        await Linking.openSettings()
      } catch (fallbackError) {
        console.error('Error abriendo configuración general:', fallbackError)
        Alert.alert(
          t('common.error'),
          t('screens.attendanceCheck.deviceSettingsError')
        )
      }
    }
  }, [t])

  const onClosePasswordDrawer = useCallback(() => {
    setShowPasswordDrawer(false)
    setPassword('')
    setPasswordError(null)
    setIsLoadingLocation(false)
  }, [])

  const setPasswordHandler = useCallback((password: string) => {
    setPassword(password)
  }, [])

  const onConfirmPasswordDrawer = useCallback(() => {
    setShowPasswordDrawer(false)
    setPassword('')
    setPasswordError(null)
    setIsLoadingLocation(false)
  }, [])

  const onPasswordSubmit = useCallback(async (password: string) => {
    const error = await validatePassword(password)
    if (!error) {
      onPasswordSuccess?.()
    } else {
      setPasswordError(error)
      throw new Error(error) // Throw para que el componente maneje el error
    }
  }, [onPasswordSuccess, validatePassword])

  // Filtrar datos de salida basándose en la hora del turno
  const filteredAttendanceData = useMemo(() => {
    const shouldShowCheckOut = isCheckOutTimeReached()
    
    return {
      ...attendanceData,
      checkOutTime: shouldShowCheckOut ? attendanceData.checkOutTime : null,
      checkOutStatus: shouldShowCheckOut ? attendanceData.checkOutStatus : null
    }
  }, [attendanceData, isCheckOutTimeReached])

  // Optimizaciones movidas desde el componente
  const isButtonDisabled = useMemo(() => 
    // isButtonLocked || isLoadingLocation || !!filteredAttendanceData.checkOutTime, [isButtonLocked, isLoadingLocation, filteredAttendanceData.checkOutTime]
    isButtonLocked || isLoadingLocation, [isButtonLocked, isLoadingLocation]
  )

  const buttonText = useMemo(() => {
    if (isLoadingLocation) return t('screens.attendanceCheck.button.loading')
    if (isButtonLocked) return t('screens.attendanceCheck.button.locked')
    if (filteredAttendanceData.checkOutTime) return t('screens.attendanceCheck.button.complete')
    return t('screens.attendanceCheck.button.register')
  }, [isLoadingLocation, isButtonLocked, filteredAttendanceData.checkOutTime, t])

  const locationContent = useMemo(() => {
    if (currentLocation) {
      return {
        coordinates: formatCoordinates(currentLocation),
        accuracy: formatAccuracy(currentLocation)
      }
    }
    return null
  }, [currentLocation, formatCoordinates, formatAccuracy])

  const backdropComponent = useCallback((props: any) => (
    <BottomSheetBackdrop 
      {...props} 
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.5}
    />
  ), [])

  const getShiftDate = useCallback(async (): Promise<string> => {
    return await setShiftDateData()
  }, [setShiftDateData])

  /**
   * Reintenta cargar los datos de asistencia
   * @returns {Promise<void>}
   */
  const retryLoadData = useCallback(async (): Promise<void> => {
    if (isRetrying) return // Evitar múltiples reintentos simultáneos
    
    setIsRetrying(true)
    try {
      await setShiftDateData()
    } catch (error) {
      console.error('Error retrying to load shift data:', error)
    } finally {
      setIsRetrying(false)
    }
  }, [setShiftDateData, isRetrying])

  // Memorizar el objeto de retorno completo para evitar recreaciones innecesarias
  const controllerValue = useMemo(() => ({
    themeType,
    shiftDate,
    getShiftDate,
    isButtonLocked,
    isLoadingLocation,
    handleCheckIn,
    // checkInTime,
    currentLocation,
    formatCoordinates,
    formatAccuracy,
    bottomSheetRef,
    snapPoints,
    showPasswordDrawer,
    setShowPasswordDrawer,
    validatePassword,
    passwordError,
    setPasswordError,
    onPasswordSuccess,
    setOnPasswordSuccess,
    handlePasswordSubmit,
    onClosePasswordDrawer,
    password,
    setPasswordHandler,
    onConfirmPasswordDrawer,
    onPasswordSubmit,
    // Nuevas optimizaciones
    isButtonDisabled,
    buttonText,
    locationContent,
    backdropComponent,
    // Nuevos datos de asistencia
    attendanceData: filteredAttendanceData,
    getStatusColor,
    isCheckOutTimeReached,
    hasConnectionError,
    retryLoadData,
    isRetrying
  }), [
    themeType,
    shiftDate,
    isButtonLocked,
    isLoadingLocation,
    handleCheckIn,
    // checkInTime,
    currentLocation,
    formatCoordinates,
    formatAccuracy,
    snapPoints,
    showPasswordDrawer,
    validatePassword,
    passwordError,
    onPasswordSuccess,
    handlePasswordSubmit,
    onClosePasswordDrawer,
    password,
    setPasswordHandler,
    onConfirmPasswordDrawer,
    onPasswordSubmit,
    isButtonDisabled,
    buttonText,
    locationContent,
    backdropComponent,
    // Servicios pre-instanciados para dependencias
    authStateController,
    biometricService,
    locationService,
    passwordService,
    getShiftDate,
    // Nuevos datos
    filteredAttendanceData,
    getStatusColor,
    isCheckOutTimeReached,
    hasConnectionError,
    clearSessionController,
    retryLoadData,
    isRetrying
  ])

  return controllerValue
}

export { AttendanceCheckScreenController }
