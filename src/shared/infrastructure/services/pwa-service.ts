import { Platform } from 'react-native'
import { ISystemSetting } from '../../../features/attendance/domain/types/system-setting.interface'

/**
 * Interfaz para la configuración del manifest PWA
 */
export interface IPWAManifest {
  name: string
  short_name: string
  description: string
  start_url: string
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
  orientation: 'portrait' | 'landscape' | 'any'
  background_color: string
  theme_color?: string
  icons: Array<{
    src: string
    sizes: string
    type: string
    purpose?: string
  }>
}

/**
 * Interfaz para el evento de instalación de PWA
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

/**
 * Servicio para gestionar la funcionalidad PWA
 * @class PWAServiceClass
 * @singleton
 */
class PWAServiceClass {
  private static instance: PWAServiceClass
  private deferredPrompt: BeforeInstallPromptEvent | null = null
  private isInstallable = false
  private manifestElement: HTMLLinkElement | null = null
  private currentManifest: IPWAManifest | null = null

  private constructor() {
    if (Platform.OS === 'web') {
      this.initializePWA()
    }
  }

  /**
   * Obtiene la instancia única del servicio PWA (Singleton)
   * @returns {PWAServiceClass} La instancia del servicio PWA
   */
  public static getInstance(): PWAServiceClass {
    if (!PWAServiceClass.instance) {
      PWAServiceClass.instance = new PWAServiceClass()
    }
    return PWAServiceClass.instance
  }

  /**
   * Inicializa el servicio PWA
   */
  private initializePWA(): void {
    if (typeof window === 'undefined') return

    // Escuchar evento de instalación
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      this.deferredPrompt = e as BeforeInstallPromptEvent
      this.isInstallable = true
    })

    // Detectar si ya está instalada
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null
      this.isInstallable = false
    })

    // Registrar Service Worker
    void this.registerServiceWorker()
  }

  /**
   * Registra el Service Worker
   */
  private async registerServiceWorker(): Promise<void> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      })

      // Verificar actualizaciones periódicamente
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            // New content available
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // PWA update available
            }
          })
        }
      })
    } catch (error) {
      console.error('PWA: Service Worker registration failed:', error)
    }
  }

  /**
   * Genera el manifest dinámico basado en la configuración del sistema
   * @param {ISystemSetting} systemSettings - Configuración del sistema desde la API
   * @returns {IPWAManifest} Manifest generado
   */
  public generateManifest(systemSettings: ISystemSetting): IPWAManifest {
    const defaultName = 'GSTI Plus'
    const defaultIcon = '/assets/icon.png'

    const manifest: IPWAManifest = {
      name: `${systemSettings.systemSettingTradeName || defaultName} Plus`,
      short_name: `${systemSettings.systemSettingTradeName?.substring(0, 12) || 'GSTI'} Plus`,
      description: 'Sistema de Asistencia de Empleados',
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#ffffff',
      icons: [
        {
          src: systemSettings.systemSettingFavicon || defaultIcon,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: systemSettings.systemSettingFavicon || defaultIcon,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: systemSettings.systemSettingFavicon || defaultIcon,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: systemSettings.systemSettingFavicon || defaultIcon,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    }

    this.currentManifest = manifest
    return manifest
  }

  /**
   * Aplica el manifest dinámico al documento
   * @param {ISystemSetting} systemSettings - Configuración del sistema
   */
  public applyDynamicManifest(systemSettings: ISystemSetting): void {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return

    const manifest = this.generateManifest(systemSettings)
    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' })
    const manifestUrl = URL.createObjectURL(manifestBlob)

    // Remover manifest anterior si existe
    if (this.manifestElement) {
      this.manifestElement.remove()
      URL.revokeObjectURL(this.manifestElement.href)
    }

    // Crear y agregar nuevo manifest
    this.manifestElement = document.createElement('link')
    this.manifestElement.rel = 'manifest'
    this.manifestElement.href = manifestUrl
    document.head.appendChild(this.manifestElement)

    // Actualizar meta tags
    this.updateMetaTags(systemSettings)
  }

  /**
   * Actualiza los meta tags del documento
   * @param {ISystemSetting} systemSettings - Configuración del sistema
   */
  private updateMetaTags(systemSettings: ISystemSetting): void {
    if (typeof document === 'undefined') return

    // Actualizar título
    if (systemSettings.systemSettingTradeName) {
      document.title = `${systemSettings.systemSettingTradeName} Plus`
    }

    // Actualizar theme-color
    // this.updateOrCreateMetaTag('theme-color', systemSettings.systemSettingSidebarColor || '#003366')

    // Actualizar apple-mobile-web-app-title
    this.updateOrCreateMetaTag('apple-mobile-web-app-title', `${systemSettings.systemSettingTradeName || 'GSTI'} Plus`)

    // Actualizar apple-mobile-web-app-capable
    this.updateOrCreateMetaTag('apple-mobile-web-app-capable', 'yes')

    // Actualizar apple-mobile-web-app-status-bar-style
    this.updateOrCreateMetaTag('apple-mobile-web-app-status-bar-style', 'default')

    // Actualizar favicon
    this.updateFavicon(systemSettings.systemSettingFavicon || systemSettings.systemSettingLogo)

    // Apple touch icon
    this.updateAppleTouchIcon(systemSettings.systemSettingFavicon || systemSettings.systemSettingLogo)
  }

  /**
   * Actualiza o crea un meta tag
   * @param {string} name - Nombre del meta tag
   * @param {string} content - Contenido del meta tag
   */
  private updateOrCreateMetaTag(name: string, content: string): void {
    if (typeof document === 'undefined') return

    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = name
      document.head.appendChild(meta)
    }
    meta.content = content
  }

  /**
   * Actualiza el favicon del documento
   * @param {string | null} iconUrl - URL del icono
   */
  private updateFavicon(iconUrl: string | null): void {
    if (typeof document === 'undefined' || !iconUrl) return

    let link = document.querySelector('link[rel~="icon"]') as HTMLLinkElement
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = iconUrl

    // También actualizar shortcut icon para compatibilidad
    let shortcutLink = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement
    if (!shortcutLink) {
      shortcutLink = document.createElement('link')
      shortcutLink.rel = 'shortcut icon'
      document.head.appendChild(shortcutLink)
    }
    shortcutLink.href = iconUrl
  }

  /**
   * Actualiza el apple-touch-icon
   * @param {string | null} iconUrl - URL del icono
   */
  private updateAppleTouchIcon(iconUrl: string | null): void {
    if (typeof document === 'undefined' || !iconUrl) return

    let link = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement
    if (!link) {
      link = document.createElement('link')
      link.rel = 'apple-touch-icon'
      document.head.appendChild(link)
    }
    link.href = iconUrl
  }

  /**
   * Verifica si la app puede ser instalada
   * @returns {boolean} True si la app es instalable
   */
  public canInstall(): boolean {
    return this.isInstallable && this.deferredPrompt !== null
  }

  /**
   * Verifica si la app ya está instalada como PWA
   * @returns {boolean} True si está instalada como PWA
   */
  public isInstalledAsPWA(): boolean {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return false

    // Verificar display-mode standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches

    // Verificar para iOS
    const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true

    return isStandalone || isIOSStandalone
  }

  /**
   * Muestra el prompt de instalación
   * @returns {Promise<boolean>} True si el usuario aceptó la instalación
   */
  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false
    }

    try {
      await this.deferredPrompt.prompt()
      const { outcome } = await this.deferredPrompt.userChoice

      if (outcome === 'accepted') {
        this.deferredPrompt = null
        this.isInstallable = false
        return true
      }
      return false
    } catch (error) {
      console.error('PWA: Error prompting install:', error)
      return false
    }
  }

  /**
   * Obtiene el manifest actual
   * @returns {IPWAManifest | null} El manifest actual o null
   */
  public getCurrentManifest(): IPWAManifest | null {
    return this.currentManifest
  }
}

/**
 * Instancia del servicio PWA exportada
 */
export const PWAService = PWAServiceClass.getInstance()

