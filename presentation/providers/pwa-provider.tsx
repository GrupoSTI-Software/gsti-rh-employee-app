import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { Platform, View, TouchableOpacity, Text, StyleSheet, Animated, Dimensions } from 'react-native'
import { PWAService } from '../../src/shared/infrastructure/services/pwa-service'
import { GetSystemSettingsController } from '../../src/features/attendance/infraestructure/controllers/get-system-setting/get-system-settings.controller'
import { ISystemSetting } from '../../src/features/attendance/domain/types/system-setting.interface'

/**
 * Interfaz para el contexto de PWA
 */
interface IPWAContext {
  /** Indica si la app puede ser instalada */
  canInstall: boolean
  /** Indica si la app ya está instalada como PWA */
  isInstalled: boolean
  /** Indica si estamos en un entorno web */
  isWeb: boolean
  /** Indica si el manifest dinámico fue aplicado */
  manifestApplied: boolean
  /** Configuración del sistema desde la API */
  systemSettings: ISystemSetting | null
  /** Inicia el proceso de instalación */
  promptInstall: () => Promise<boolean>
  /** Actualiza la configuración desde la API */
  refreshSettings: () => Promise<void>
  /** Muestra el banner de instalación */
  showInstallBanner: () => void
  /** Oculta el banner de instalación */
  hideInstallBanner: () => void
}

const PWAContext = createContext<IPWAContext | null>(null)

/**
 * Props del proveedor PWA
 */
interface PWAProviderProps {
  children: ReactNode
  /** Muestra automáticamente el banner de instalación */
  autoShowBanner?: boolean
  /** Retraso para mostrar el banner (en ms) */
  bannerDelay?: number
}

/**
 * Proveedor de contexto PWA
 * Gestiona el estado de la PWA y proporciona funcionalidad de instalación
 */
export const PWAProvider: React.FC<PWAProviderProps> = ({
  children,
  autoShowBanner = true,
  bannerDelay = 5000
}) => {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [manifestApplied, setManifestApplied] = useState(false)
  const [systemSettings, setSystemSettings] = useState<ISystemSetting | null>(null)
  const [bannerVisible, setBannerVisible] = useState(false)
  const [bannerAnimation] = useState(new Animated.Value(-100))

  const isWeb = Platform.OS === 'web'

  /**
   * Actualiza el estado de instalación
   */
  const updateInstallState = useCallback(() => {
    if (!isWeb) return

    setCanInstall(PWAService.canInstall())
    setIsInstalled(PWAService.isInstalledAsPWA())
  }, [isWeb])

  /**
   * Obtiene la configuración del sistema
   */
  const fetchSystemSettings = useCallback(async (): Promise<ISystemSetting | null> => {
    try {
      const controller = new GetSystemSettingsController()
      const settings = await controller.getSystemSettings()
      return settings?.props || null
    } catch (error) {
      console.error('PWAProvider: Error fetching system settings:', error)
      return null
    }
  }, [])

  /**
   * Refresca la configuración
   */
  const refreshSettings = useCallback(async (): Promise<void> => {
    try {
      const settings = await fetchSystemSettings()
      if (settings) {
        setSystemSettings(settings)
        if (isWeb) {
          PWAService.applyDynamicManifest(settings)
          setManifestApplied(true)
        }
      }
    } catch (error) {
      console.error('PWAProvider: Error refreshing settings:', error)
    }
  }, [fetchSystemSettings, isWeb])

  /**
   * Muestra el banner de instalación
   */
  const showInstallBanner = useCallback(() => {
    if (!canInstall || isInstalled) return

    setBannerVisible(true)
    Animated.spring(bannerAnimation, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8
    }).start()
  }, [canInstall, isInstalled, bannerAnimation])

  /**
   * Oculta el banner de instalación
   */
  const hideInstallBanner = useCallback(() => {
    Animated.timing(bannerAnimation, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setBannerVisible(false)
    })
  }, [bannerAnimation])

  /**
   * Inicia el proceso de instalación
   */
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!isWeb) return false

    try {
      const installed = await PWAService.promptInstall()
      if (installed) {
        setIsInstalled(true)
        setCanInstall(false)
        hideInstallBanner()
      }
      return installed
    } catch (error) {
      console.error('PWAProvider: Error prompting install:', error)
      return false
    }
  }, [isWeb, hideInstallBanner])

  /**
   * Inicialización
   */
  useEffect(() => {
    if (!isWeb) return

    // Actualizar estado inicial
    updateInstallState()

    // Escuchar cambios
    const handleInstallStateChange = () => {
      updateInstallState()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleInstallStateChange)
      window.addEventListener('appinstalled', handleInstallStateChange)

      // Mostrar banner automáticamente después del retraso
      if (autoShowBanner && PWAService.canInstall() && !PWAService.isInstalledAsPWA()) {
        const timer = setTimeout(() => {
          showInstallBanner()
        }, bannerDelay)

        return () => {
          clearTimeout(timer)
          window.removeEventListener('beforeinstallprompt', handleInstallStateChange)
          window.removeEventListener('appinstalled', handleInstallStateChange)
        }
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleInstallStateChange)
        window.removeEventListener('appinstalled', handleInstallStateChange)
      }
    }
  }, [isWeb, updateInstallState, autoShowBanner, bannerDelay, showInstallBanner])

  const contextValue: IPWAContext = {
    canInstall,
    isInstalled,
    isWeb,
    manifestApplied,
    systemSettings,
    promptInstall,
    refreshSettings,
    showInstallBanner,
    hideInstallBanner
  }

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
      {/* Banner de instalación PWA */}
      {isWeb && bannerVisible && (
        <Animated.View
          style={[
            styles.installBanner,
            { transform: [{ translateY: bannerAnimation }] }
          ]}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>
                {systemSettings?.systemSettingTradeName || 'SAE Empleados'}
              </Text>
              <Text style={styles.bannerSubtitle}>
                Instala la app para acceso rápido
              </Text>
            </View>
            <View style={styles.bannerButtons}>
              <TouchableOpacity
                style={styles.installButton}
                onPress={promptInstall}
                accessibilityLabel="Instalar aplicación"
              >
                <Text style={styles.installButtonText}>Instalar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={hideInstallBanner}
                accessibilityLabel="Cerrar banner"
              >
                <Text style={styles.dismissButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </PWAContext.Provider>
  )
}

/**
 * Hook para acceder al contexto PWA
 * @returns {IPWAContext} Contexto de PWA
 * @throws {Error} Si se usa fuera del PWAProvider
 */
export const usePWAContext = (): IPWAContext => {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error('usePWAContext must be used within a PWAProvider')
  }
  return context
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  installBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#003366',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999
  },
  bannerContent: {
    flexDirection: width > 600 ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%'
  },
  bannerTextContainer: {
    flex: 1,
    marginBottom: width > 600 ? 0 : 12
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13
  },
  bannerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  installButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6
  },
  installButtonText: {
    color: '#003366',
    fontWeight: '600',
    fontSize: 14
  },
  dismissButton: {
    padding: 10
  },
  dismissButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '400'
  }
})

export default PWAProvider

