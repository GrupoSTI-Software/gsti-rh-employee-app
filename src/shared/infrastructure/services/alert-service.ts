import { Alert, Platform } from 'react-native'

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

type AlertShowFunction = (options: AlertOptions) => void

/**
 * Servicio de alertas multiplataforma
 * Funciona tanto en web como en móvil
 */
class AlertServiceClass {
  private customAlertHandler: AlertShowFunction | null = null

  /**
   * Registra un manejador de alertas personalizado (usado por el AlertProvider)
   */
  setCustomAlertHandler(handler: AlertShowFunction) {
    this.customAlertHandler = handler
  }

  /**
   * Limpia el manejador de alertas personalizado
   */
  clearCustomAlertHandler() {
    this.customAlertHandler = null
  }

  /**
   * Muestra una alerta usando el método apropiado para la plataforma
   */
  show(title: string, message: string, buttons?: AlertButton[]) {
    // En web, usar el manejador personalizado o window.alert como fallback
    if (Platform.OS === 'web') {
      if (this.customAlertHandler) {
        this.customAlertHandler({ title, message, buttons })
      } else {
        // Fallback para web si no hay manejador personalizado
        const result = window.confirm(`${title}\n\n${message}`)
        if (result && buttons) {
          // Ejecutar el primer botón no-cancel si confirma
          const confirmButton = buttons.find(b => b.style !== 'cancel')
          confirmButton?.onPress?.()
        } else if (!result && buttons) {
          // Ejecutar el botón cancel si cancela
          const cancelButton = buttons.find(b => b.style === 'cancel')
          cancelButton?.onPress?.()
        }
      }
      return
    }

    // En móvil, usar el manejador personalizado o Alert.alert nativo
    if (this.customAlertHandler) {
      this.customAlertHandler({ title, message, buttons })
    } else {
      // Convertir los botones al formato de React Native Alert
      const nativeButtons = buttons?.map(button => ({
        text: button.text,
        onPress: button.onPress,
        style: button.style
      }))
      Alert.alert(title, message, nativeButtons)
    }
  }

  /**
   * Muestra una alerta de error
   */
  error(title: string, message: string, onClose?: () => void) {
    this.show(title, message, [
      { text: 'OK', onPress: onClose, style: 'default' }
    ])
  }

  /**
   * Muestra una alerta de información
   */
  info(title: string, message: string, onClose?: () => void) {
    this.show(title, message, [
      { text: 'OK', onPress: onClose, style: 'default' }
    ])
  }

  /**
   * Muestra una alerta de confirmación
   */
  confirm(
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void,
    confirmText = 'OK',
    cancelText = 'Cancel'
  ) {
    this.show(title, message, [
      { text: cancelText, onPress: onCancel, style: 'cancel' },
      { text: confirmText, onPress: onConfirm, style: 'default' }
    ])
  }
}

// Exportar una instancia singleton
export const AlertService = new AlertServiceClass()

