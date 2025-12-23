import { useState, useEffect, useCallback } from 'react'
import { Platform } from 'react-native'
import { PWAService } from '../../src/shared/infrastructure/services/pwa-service'
import { GetSystemSettingsController } from '../../src/features/attendance/infraestructure/controllers/get-system-setting/get-system-settings.controller'
import { ISystemSetting } from '../../src/features/attendance/domain/types/system-setting.interface'

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
    systemSettings: null
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

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleInstallStateChange)
      window.addEventListener('appinstalled', handleInstallStateChange)
    }

    // No cargar configuración automáticamente - dejarlo para cuando la API esté disponible
    setState(prev => ({ ...prev, isLoading: false }))

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleInstallStateChange)
        window.removeEventListener('appinstalled', handleInstallStateChange)
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
    applyManifest
  }

  return [state, actions]
}

export default usePWA

