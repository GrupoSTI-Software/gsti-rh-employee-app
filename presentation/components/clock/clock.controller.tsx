import { DateTime } from 'luxon'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, AppStateStatus } from 'react-native'

/**
 * Controlador del reloj
 * @returns {Object} Propiedades y funciones accesibles desde la UI
 * @property {string} hour - Hora actual
 * @property {string} date - Fecha actual
 */
const ClockController = () => {
  const { i18n } = useTranslation()
  const [currentTime, setCurrentTime] = useState(DateTime.now().setLocale('es'))
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const appStateRef = useRef(AppState.currentState)

  const hour = currentTime.toFormat('HH:mm:ss')
  const date = currentTime.setLocale(i18n.language).toFormat('DDDD')

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )

    startTimer()

    return () => {
      stopTimer()
      subscription.remove()
    }
  }, [])

  /**
   * Inicia el temporizador
   * @returns {void}
   */
  const startTimer = () => {
    stopTimer()

    setCurrentTime(DateTime.now().setLocale('es'))

    const now = DateTime.now().setLocale('es')
    const millisToNextSecond = 1000 - now.millisecond
    const syncTimeout = setTimeout(() => {
      setCurrentTime(DateTime.now().setLocale('es'))

      timerRef.current = setInterval(() => {
        setCurrentTime(DateTime.now().setLocale('es'))
      }, 1000)
    }, millisToNextSecond)

    timerRef.current = syncTimeout as unknown as NodeJS.Timeout
  }

  /**
   * Detiene el temporizador
   * @returns {void}
   */
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      clearTimeout(timerRef.current as unknown as NodeJS.Timeout)
      timerRef.current = null
    }
  }

  /**
   * Maneja el cambio de estado de la aplicación
   * @param {AppStateStatus} nextAppState - Estado de la aplicación
   * @returns {void}
   */
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appStateRef.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      setCurrentTime(DateTime.now().setLocale('es'))
      startTimer()
    } else if (
      nextAppState.match(/inactive|background/) &&
      appStateRef.current === 'active'
    ) {
      stopTimer()
    }

    appStateRef.current = nextAppState
  }

  return {
    hour,
    date
  }
}

export { ClockController }
