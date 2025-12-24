import React, { createContext, useCallback, useContext, useState, ReactNode, useEffect } from 'react'
import { Platform } from 'react-native'
import CustomAlert from '../components/custom-alert/custom-alert'
import { AlertService } from '../../src/shared/infrastructure/services/alert-service'

interface AlertButton {
  text: string
  onPress?: () => void
  style?: 'default' | 'cancel' | 'destructive'
}

interface AlertOptions {
  title: string
  message: string
  buttons?: AlertButton[]
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void
  hideAlert: () => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

interface AlertProviderProps {
  children: ReactNode
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false)
  const [alertOptions, setAlertOptions] = useState<AlertOptions>({
    title: '',
    message: '',
    buttons: []
  })

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertOptions(options)
    setVisible(true)
  }, [])

  // Registrar el manejador de alertas en el servicio cuando se monte
  useEffect(() => {
    AlertService.setCustomAlertHandler(showAlert)
    return () => {
      AlertService.clearCustomAlertHandler()
    }
  }, [showAlert])

  const hideAlert = useCallback(() => {
    setVisible(false)
    // Ejecutar el callback del primer botón si existe
    const firstButton = alertOptions.buttons?.[0]
    if (firstButton?.onPress) {
      firstButton.onPress()
    }
  }, [alertOptions.buttons])

  const handleButtonPress = useCallback((button: AlertButton) => {
    setVisible(false)
    if (button.onPress) {
      // Pequeño delay para permitir que el modal se cierre antes de ejecutar la acción
      setTimeout(() => {
        button.onPress?.()
      }, 100)
    }
  }, [])

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        visible={visible}
        title={alertOptions.title}
        message={alertOptions.message}
        buttons={alertOptions.buttons}
        onClose={hideAlert}
        onButtonPress={handleButtonPress}
      />
    </AlertContext.Provider>
  )
}

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}

/**
 * Función helper para mostrar alertas sin necesidad del hook
 * Útil para usar en servicios o controladores fuera de componentes
 */
let globalShowAlert: ((options: AlertOptions) => void) | null = null

export const setGlobalShowAlert = (fn: (options: AlertOptions) => void) => {
  globalShowAlert = fn
}

export const showGlobalAlert = (title: string, message: string, buttons?: AlertButton[]) => {
  if (globalShowAlert) {
    globalShowAlert({ title, message, buttons })
  } else if (Platform.OS === 'web') {
    // Fallback para web si el provider no está disponible
    window.alert(`${title}\n\n${message}`)
  }
}

export default AlertProvider

