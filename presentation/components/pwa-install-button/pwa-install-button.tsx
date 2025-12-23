import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import { PWAService } from '../../../src/shared/infrastructure/services/pwa-service'

/**
 * Props del botón de instalación PWA
 */
interface PWAInstallButtonProps {
  /** Estilo personalizado del contenedor */
  style?: object
  /** Callback cuando se instala la app */
  onInstall?: () => void
  /** Mostrar solo si la app es instalable */
  showOnlyIfInstallable?: boolean
}

/**
 * Botón para instalar la aplicación como PWA
 */
export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  style,
  onInstall,
  showOnlyIfInstallable = true
}) => {
  const { t } = useTranslation()
  const [canInstall, setCanInstall] = React.useState(false)
  const [isInstalled, setIsInstalled] = React.useState(false)

  React.useEffect(() => {
    if (Platform.OS !== 'web') return

    const updateState = () => {
      setCanInstall(PWAService.canInstall())
      setIsInstalled(PWAService.isInstalledAsPWA())
    }

    updateState()

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', updateState)
      window.addEventListener('appinstalled', updateState)

      return () => {
        window.removeEventListener('beforeinstallprompt', updateState)
        window.removeEventListener('appinstalled', updateState)
      }
    }
  }, [])

  const handleInstall = async () => {
    const installed = await PWAService.promptInstall()
    if (installed) {
      setIsInstalled(true)
      setCanInstall(false)
      onInstall?.()
    }
  }

  // No mostrar en plataformas no web
  if (Platform.OS !== 'web') {
    return null
  }

  // Si ya está instalada, mostrar mensaje
  if (isInstalled) {
    return (
      <View style={[styles.container, styles.installedContainer, style]}>
        <Text style={styles.installedIcon}>✓</Text>
        <Text style={styles.installedText}>
          {t('pwa.installed', { defaultValue: 'App instalada' })}
        </Text>
      </View>
    )
  }

  // Si no se puede instalar y showOnlyIfInstallable es true, no mostrar
  if (!canInstall && showOnlyIfInstallable) {
    return null
  }

  // Si no se puede instalar pero queremos mostrarlo deshabilitado
  if (!canInstall) {
    return (
      <View style={[styles.container, styles.disabledContainer, style]}>
        <Text style={styles.disabledIcon}>📱</Text>
        <View style={styles.textContainer}>
          <Text style={styles.disabledTitle}>
            {t('pwa.notAvailable', { defaultValue: 'Instalación no disponible' })}
          </Text>
          <Text style={styles.disabledSubtitle}>
            {t('pwa.openInBrowser', { defaultValue: 'Abre esta página en Chrome o Safari' })}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <TouchableOpacity
      style={[styles.container, styles.installableContainer, style]}
      onPress={handleInstall}
      accessibilityLabel={t('pwa.install', { defaultValue: 'Instalar aplicación' })}
      accessibilityRole="button"
    >
      <Text style={styles.installIcon}>📲</Text>
      <View style={styles.textContainer}>
        <Text style={styles.installTitle}>
          {t('pwa.installTitle', { defaultValue: 'Instalar aplicación' })}
        </Text>
        <Text style={styles.installSubtitle}>
          {t('pwa.installSubtitle', { defaultValue: 'Acceso rápido desde tu pantalla de inicio' })}
        </Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8
  },
  installableContainer: {
    backgroundColor: '#003366',
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  installedContainer: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4caf50'
  },
  disabledContainer: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  installIcon: {
    fontSize: 28,
    marginRight: 12
  },
  installedIcon: {
    fontSize: 24,
    marginRight: 12,
    color: '#4caf50'
  },
  disabledIcon: {
    fontSize: 24,
    marginRight: 12,
    opacity: 0.5
  },
  textContainer: {
    flex: 1
  },
  installTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  installSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13
  },
  installedText: {
    color: '#2e7d32',
    fontSize: 15,
    fontWeight: '500'
  },
  disabledTitle: {
    color: '#757575',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2
  },
  disabledSubtitle: {
    color: '#9e9e9e',
    fontSize: 12
  },
  arrow: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600'
  }
})

export default PWAInstallButton

