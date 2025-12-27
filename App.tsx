/* eslint-disable require-jsdoc */
 
import React, { useEffect, useState } from 'react'
import { Provider as PaperProvider } from 'react-native-paper'
import { Alert, Platform } from 'react-native'
import './src/shared/domain/i18n/i18n'
import { ThemeProvider, useAppTheme } from './presentation/theme/theme-context'
import { AppNavigator } from './navigation/app-navigator'
import { ExpoUpdatesService } from './src/shared/infrastructure/services/expo-updates-service'
import { PWAProvider } from './presentation/providers/pwa-provider'
import { AlertProvider } from './presentation/providers/alert-provider'
import { PWARequiredScreen } from './presentation/screens/pwa-required'
import { PWAService } from './src/shared/infrastructure/services/pwa-service'

/**
 * Verifica si la app está ejecutándose en un navegador web (no como PWA instalada)
 */
const isRunningInBrowser = (): boolean => {
  if (Platform.OS !== 'web') return false
  return !PWAService.isInstalledAsPWA()
}

// Wrap everything in our theme provider
const ThemedApp: React.FC = () => {
  const { theme } = useAppTheme()
  const [showPWARequired, setShowPWARequired] = useState<boolean | null>(null)

  useEffect(() => {
    // Verificar si estamos en un navegador web (no PWA instalada)
    if (Platform.OS === 'web') {
      // Pequeño delay para asegurar que el display-mode sea detectado correctamente
      const checkPWAStatus = () => {
        const inBrowser = isRunningInBrowser()
        setShowPWARequired(inBrowser)
      }

      // Verificar inmediatamente
      checkPWAStatus()

      // También verificar después de un pequeño delay por si el matchMedia tarda
      const timer = setTimeout(checkPWAStatus, 100)

      // Escuchar cambios en el display-mode
      if (typeof window !== 'undefined') {
        const mediaQuery = window.matchMedia('(display-mode: standalone)')
        const handleChange = () => {
          checkPWAStatus()
        }
        
        mediaQuery.addEventListener?.('change', handleChange)
        
        return () => {
          clearTimeout(timer)
          mediaQuery.removeEventListener?.('change', handleChange)
        }
      }

      return () => clearTimeout(timer)
    } else {
      setShowPWARequired(false)
    }
  }, [])

  useEffect(() => {
    // Check for updates when app loads (only on native platforms)
    if (Platform.OS !== 'web') {
      ExpoUpdatesService.checkAndApplyUpdates((onReload) => {
        Alert.alert(
          'Actualización disponible',
          'Hay una nueva versión disponible. ¿Desea actualizar ahora?',
          [
            { text: 'Más tarde', style: 'cancel' },
            { text: 'Actualizar', onPress: onReload }
          ],
          { cancelable: false }
        )
      })
    }
  }, [])

  // Mientras se determina el estado, no mostrar nada
  if (showPWARequired === null) {
    return null
  }

  // Si estamos en el navegador (no PWA), mostrar pantalla de instalación requerida
  if (showPWARequired) {
    return (
      <PaperProvider theme={theme}>
        <PWARequiredScreen />
      </PaperProvider>
    )
  }

  return (
    <PaperProvider theme={theme}>
      <AlertProvider>
        <PWAProvider autoShowBanner={false} bannerDelay={8000}>
          <AppNavigator />
        </PWAProvider>
      </AlertProvider>
    </PaperProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  )
}
