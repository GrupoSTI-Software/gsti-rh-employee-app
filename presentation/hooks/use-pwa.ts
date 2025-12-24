import { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { ISystemSetting } from '../../src/features/attendance/domain/types/system-setting.interface'
import { GetSystemSettingsController } from '../../src/features/attendance/infraestructure/controllers/get-system-setting/get-system-settings.controller'
import { PWAService } from '../../src/shared/infrastructure/services/pwa-service'

/**
 * Interfaz para el estado de la PWA
 */
export interface IPWAState {
  /** Indica si la app puede ser instalada */
  canInstall: boolean
  /** Indica si la app ya está instalada como PWA */
  isInstalled: boolean
  /** Indica si estamos en un entorno web */
  isWeb: boolean
  /** Indica si el manifest dinámico fue aplicado */
  manifestApplied: boolean
  /** Indica si está cargando la configuración */
  isLoading: boolean
  /** Error si hubo alguno */
  error: string | null
  /** Configuración del sistema desde la API */
  systemSettings: ISystemSetting | null
  /** Indica si hay una actualización disponible */
  updateAvailable: boolean
  /** Indica si se está actualizando */
  isUpdating: boolean
}

/**
 * Interfaz para las acciones de la PWA
 */
export interface IPWAActions {
  /** Inicia el proceso de instalación de la PWA */
  promptInstall: () => Promise<boolean>
  /** Actualiza la configuración desde la API */
  refreshSettings: () => Promise<void>
  /** Aplica el manifest dinámico manualmente */
  applyManifest: () => void
  /** Aplica la actualización pendiente (recarga la app) */
  applyUpdate: () => void
  /** Verifica si hay actualizaciones disponibles */
  checkForUpdates: () => Promise<void>
  /** Limpia todo el cache y recarga */
  clearCacheAndReload: () => Promise<void>
}

/**
 * Hook personalizado para gestionar la funcionalidad PWA
 * @returns {[IPWAState, IPWAActions]} Tupla con el estado y las acciones de PWA
 */
export const usePWA = (): [IPWAState, IPWAActions] => {
  const [state, setState] = useState<IPWAState>({
    canInstall: false,
    isInstalled: false,
    isWeb: Platform.OS === 'web',
    manifestApplied: false,
    isLoading: true,
    error: null,
    systemSettings: null,
    updateAvailable: false,
    isUpdating: false
  })

  /**
   * Obtiene la configuración del sistema desde la API
   */
  const fetchSystemSettings = useCallback(async (): Promise<ISystemSetting | null> => {
    try {
      const controller = new GetSystemSettingsController()
      const settings = await controller.getSystemSettings()
      return settings?.props || null
    } catch (error) {
      console.error('usePWA: Error fetching system settings:', error)
      return null
    }
  }, [])

  /**
   * Aplica el manifest dinámico
   */
  const applyManifest = useCallback(() => {
    if (!state.isWeb || !state.systemSettings) return

    try {
      PWAService.applyDynamicManifest(state.systemSettings)
      setState(prev => ({
        ...prev,
        manifestApplied: true
      }))
    } catch (error) {
      console.error('usePWA: Error applying manifest:', error)
      setState(prev => ({
        ...prev,
        error: 'Error applying PWA manifest'
      }))
    }
  }, [state.isWeb, state.systemSettings])

  /**
   * Actualiza el estado de instalación
   */
  const updateInstallState = useCallback(() => {
    if (!state.isWeb) return

    setState(prev => ({
      ...prev,
      canInstall: PWAService.canInstall(),
      isInstalled: PWAService.isInstalledAsPWA()
    }))
  }, [state.isWeb])

  /**
   * Inicia el proceso de instalación
   */
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!state.isWeb) return false

    try {
      const installed = await PWAService.promptInstall()
      if (installed) {
        setState(prev => ({
          ...prev,
          isInstalled: true,
          canInstall: false
        }))
      }
      return installed
    } catch (error) {
      console.error('usePWA: Error prompting install:', error)
      setState(prev => ({
        ...prev,
        error: 'Error during installation'
      }))
      return false
    }
  }, [state.isWeb])

  /**
   * Refresca la configuración desde la API
   */
  const refreshSettings = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const settings = await fetchSystemSettings()
      setState(prev => ({
        ...prev,
        systemSettings: settings,
        isLoading: false
      }))

      // Aplicar manifest si tenemos configuración
      if (settings && state.isWeb) {
        PWAService.applyDynamicManifest(settings)
        setState(prev => ({
          ...prev,
          manifestApplied: true
        }))
      }
    } catch (error) {
      console.error('usePWA: Error refreshing settings:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error loading system settings'
      }))
    }
  }, [fetchSystemSettings, state.isWeb])

  /**
   * Aplica la actualización pendiente recargando la página
   */
  const applyUpdate = useCallback(() => {
    if (!state.isWeb || typeof window === 'undefined') return

    setState(prev => ({ ...prev, isUpdating: true }))
    
    // Notificar al SW que aplique la actualización y recargar
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
    }
    
    // Recargar la página después de un breve delay
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }, [state.isWeb])

  /**
   * Verifica si hay actualizaciones disponibles
   */
  const checkForUpdates = useCallback(async (): Promise<void> => {
    if (!state.isWeb || typeof navigator === 'undefined') return

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
        }
      }
    } catch (error) {
      console.error('usePWA: Error checking for updates:', error)
    }
  }, [state.isWeb])

  /**
   * Limpia todo el cache y recarga la app
   */
  const clearCacheAndReload = useCallback(async (): Promise<void> => {
    if (!state.isWeb || typeof navigator === 'undefined') return

    setState(prev => ({ ...prev, isUpdating: true }))

    try {
      // Enviar mensaje al SW para limpiar cache
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel()
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data.type === 'CACHE_CLEARED') {
            window.location.reload()
          }
        }
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        )
        
        // Timeout de seguridad - recargar después de 3 segundos si no hay respuesta
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      } else {
        // Si no hay SW, solo recargar
        window.location.reload()
      }
    } catch (error) {
      console.error('usePWA: Error clearing cache:', error)
      // Recargar de todos modos
      window.location.reload()
    }
  }, [state.isWeb])

  /**
   * Inicialización del hook
   */
  useEffect(() => {
    if (!state.isWeb) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    // Inicializar estado de instalación
    updateInstallState()

    // Escuchar cambios en el estado de instalación
    const handleInstallStateChange = () => {
      updateInstallState()
    }

    // Escuchar mensajes del Service Worker
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        setState(prev => ({
          ...prev,
          updateAvailable: true
        }))
      }
    }

    // Detectar cuando hay un nuevo SW esperando
    const handleSWUpdate = () => {
      if ('serviceWorker' in navigator) {
        void navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration?.waiting) {
            setState(prev => ({
              ...prev,
              updateAvailable: true
            }))
          }
        })
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleInstallStateChange)
      window.addEventListener('appinstalled', handleInstallStateChange)
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', handleSWMessage)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // El SW cambió, puede que necesitemos recargar
        })
        
        // Verificar actualizaciones al cargar
        handleSWUpdate()
      }
    }

    // No cargar configuración automáticamente - dejarlo para cuando la API esté disponible
    setState(prev => ({ ...prev, isLoading: false }))

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleInstallStateChange)
        window.removeEventListener('appinstalled', handleInstallStateChange)
        
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.removeEventListener('message', handleSWMessage)
        }
      }
    }
  }, [state.isWeb, updateInstallState])

  /**
   * Aplicar manifest cuando cambie la configuración
   */
  useEffect(() => {
    if (state.systemSettings && state.isWeb && !state.manifestApplied) {
      applyManifest()
    }
  }, [state.systemSettings, state.isWeb, state.manifestApplied, applyManifest])

  const actions: IPWAActions = {
    promptInstall,
    refreshSettings,
    applyManifest,
    applyUpdate,
    checkForUpdates,
    clearCacheAndReload
  }

  return [state, actions]
}

export default usePWA
