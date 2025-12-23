import { TFunction } from 'i18next'
import { Alert, Linking, Platform } from 'react-native'

/**
 * Abre la configuración de ubicación del dispositivo
 * @returns {Promise<void>}
 */
export const openLocationSettings = async (t: TFunction<'translation', undefined>): Promise<void> => {
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
}
