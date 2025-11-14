import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AxiosError } from 'axios'
import { CameraView, useCameraPermissions } from 'expo-camera'
import fetch from 'node-fetch'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { RootStackParamList } from '../../../navigation/types/types'
import { GetAttendanceController } from '../../../src/features/attendance/infraestructure/controllers/get-attendance/get-attendance.controller'
import { StoreAssistanceController } from '../../../src/features/attendance/infraestructure/controllers/store-assistance/store-assistance.controller'
import { AuthStateController } from '../../../src/features/authentication/infrastructure/controllers/auth-state.controller'
import { ClearSessionController } from '../../../src/features/authentication/infrastructure/controllers/clear-seassion.controller'
import { BiometricsService } from '../../../src/features/authentication/infrastructure/services/biometrics.service'
import { ILocationCoordinates, LocationService } from '../../../src/features/authentication/infrastructure/services/location.service'
import { PasswordPromptService } from '../../../src/features/authentication/infrastructure/services/password-prompt.service'
import { useAppTheme } from '../../theme/theme-context'
import { isCheckOutTimeReached } from './utils/is-checkout-time-reached.util'
import { openLocationSettings } from './utils/open-location-settings'
import { validateLocationInBackground } from './utils/validate-location-in-background'
import { validatePassword } from './utils/validate-password.util'


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
  const [showFaceScreen, setShowFaceScreen] = useState(false)
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
  // Camera
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef<CameraView | null>(null)
  const [status, setStatus] = useState('📸 Esperando permiso...')
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    void (async () => {
      if (!permission?.granted) {
        await requestPermission()
      } else {
        // setReady(true)
        setStatus('📷 Cámara lista')
      }
    })()
  }, [permission])
  // Definir setShiftDateData antes de usarlo en useEffect
  const setShiftDateData = useCallback(async (): Promise<string> => {
    
    try {
      const attendanceController = new GetAttendanceController()
      const attendance =  await attendanceController.getAttendance()
      // Éxito: limpiar error de conexión
      setHasConnectionError(false)
      const shiftInfo = attendance?.props.shiftInfo ? attendance?.props.shiftInfo : ''
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
      
      if (shiftInfo) {
        const endTime = extractEndTime(shiftInfo)
        setShiftEndTime(endTime)
      }

      const attendanceProps: Partial<IAttendanceData> = attendance?.props ?? {}
      const newAttendanceData: IAttendanceData = {
        checkInTime: attendanceProps.checkInTime ?? '',
        checkOutTime: attendanceProps.checkOutTime ?? '',
        checkEatInTime: attendanceProps.checkEatInTime ?? '',
        checkEatOutTime: attendanceProps.checkEatOutTime ?? '',
        checkInStatus: attendanceProps.checkInStatus ?? '',
        checkOutStatus: attendanceProps.checkOutStatus ?? '',
        checkEatInStatus: attendanceProps.checkEatInStatus ?? '',
        checkEatOutStatus: attendanceProps.checkEatOutStatus ?? ''
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
    const error = await validatePassword(password, t)
    if (!error) {
      onPasswordSuccess?.()
    } else {
      setPasswordError(error)
    }
  }, [password, onPasswordSuccess])

  /**
   * Registra la asistencia mediante petición POST al API
   * @param {number} latitude - Latitud de la ubicación
   * @param {number} longitude - Longitud de la ubicación  
   * @returns {Promise<boolean>} True si la petición fue exitosa
   */
  const registerAttendance = useCallback(async (latitude: number, longitude: number): Promise<Boolean> => {
    try {
      const assistanceController = new StoreAssistanceController()
      const storeAssistance =  await assistanceController.storeAssist(latitude, longitude)
      return storeAssistance
    } catch (error) {
      console.error('Error registrando asistencia:', error)
      
      // Si es error 401, manejar sesión expirada
      if (error instanceof AxiosError && error.response?.status === 401) {
        const clearSessionController =  new ClearSessionController()
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
   * @returns {Promise<void>}
   */
  const performCheckIn = useCallback(async () => {
    try {
      setStatus('📷 Centra tu rostro y acércalo a la cámara')
      setIsLoading(false)
      setShowFaceScreen(true)
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
      await performCheckIn()

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
                void openLocationSettings(t)
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
    const error = await validatePassword(password, t)
    if (!error) {
      onPasswordSuccess?.()
    } else {
      setPasswordError(error)
      throw new Error(error) // Throw para que el componente maneje el error
    }
  }, [onPasswordSuccess, validatePassword])

  // Filtrar datos de salida basándose en la hora del turno
  const filteredAttendanceData = useMemo(() => {
    const shouldShowCheckOut = !shiftEndTime || isCheckOutTimeReached(shiftEndTime)
    

    return {
      ...attendanceData,
      checkOutTime: shouldShowCheckOut ? attendanceData.checkOutTime : null,
      checkOutStatus: shouldShowCheckOut ? attendanceData.checkOutStatus : null
    }
  }, [attendanceData, shiftEndTime])

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

  // Camera
  const captureAndSend = async () => {
    if (!currentLocation) {
      setStatus('❌ No se pudo acceder a la ubicación')
      return
    }
    if (!cameraRef.current) return
    // setProcessing(true)
    if (cameraRef.current) {
      setIsLoading(true)
      try {

        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.4
        })
        // setProcessing(true)
        // setIsLoading(true)
        setStatus('⏳ Enviando al servidor...')
        const BACKEND_URL =  'http://192.168.100.13:3333/api/verify-face'
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: photo.base64 })
        })
        const data = await response.json()

        if (data.match) {
          setStatus(`✅ Misma persona (distancia: ${Number(data?.distance).toFixed(2)})`)
        
          setIsButtonLocked(true)
          setShowFaceScreen(false)
          // Registrar asistencia en el servidor
          const registrationSuccess = await registerAttendance(currentLocation.latitude, currentLocation.longitude)
        
          if (registrationSuccess) {
            // Si el registro fue exitoso, actualizar los datos locales
            // setCheckInTime(DateTime.now().setLocale('es').toFormat('HH:mm:ss'))
            
            // Recargar los datos de asistencia desde el servidor
            try {
              await setShiftDateData()
              Alert.alert(
                'Éxito',
                'Asistencia registrada correctamente ✅',
                [{ text: 'OK' }]
              )
            } catch (reloadError) {
              console.error('Error recargando datos de asistencia:', reloadError)
              // No mostramos error al usuario, ya que el registro fue exitoso
            }
          }

          setTimeout(() => {
            setIsButtonLocked(false)
          }, (2 * 1000))
        } else {
          setStatus(`❌ Persona diferente (distancia: ${Number(data?.distance).toFixed(2) ?? 'N/A'})`)
        }
      } catch (err) {
        console.error(err)
        setStatus('⚠️ Error enviando imagen ' + err)
      }

    }
    setIsLoading(false)
    // setProcessing(false)
  }
  const goBack = () => {
    setStatus('⏳ Atras...')
  }

  // Memorizar el objeto de retorno completo para evitar recreaciones innecesarias
  const controllerValue = useMemo(() => ({
    themeType,
    shiftDate,
    getShiftDate,
    isButtonLocked,
    isLoadingLocation,
    isLoading,
    showFaceScreen,
    permission,
    requestPermission,
    cameraRef,
    status,
    captureAndSend,
    goBack,
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
    isCheckOutTimeReached,
    hasConnectionError,
    clearSessionController,
    retryLoadData,
    isRetrying
  ])

  return controllerValue
}

export { AttendanceCheckScreenController }
