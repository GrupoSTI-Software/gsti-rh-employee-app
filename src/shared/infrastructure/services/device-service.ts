import * as Device from 'expo-device'
import { Platform } from 'react-native'

/**
 * Interfaz que define la información básica del dispositivo
 */
export interface IDeviceInfo {
  deviceModel: string | null
  deviceBrand: string | null
  deviceType: string | null
  deviceOs: string | null
}

/**
 * Interfaz que define la información extendida del dispositivo
 */
export interface IDeviceInfoExtended extends IDeviceInfo {
  /** Resolución de pantalla (ej: "1920x1080") */
  screenResolution: string | null
  /** Idioma del navegador/dispositivo (ej: "es-MX") */
  language: string | null
  /** Número de núcleos de CPU */
  cpuCores: number | null
  /** Memoria del dispositivo en GB (solo disponible en algunos navegadores) */
  deviceMemory: number | null
  /** Estado de conexión a internet */
  isOnline: boolean
  /** Tipo de conexión (wifi, cellular, ethernet, etc.) */
  connectionType: string | null
  /** Si el dispositivo tiene pantalla táctil */
  isTouchScreen: boolean
  /** Densidad de píxeles de la pantalla */
  pixelRatio: number | null
  /** Si la app está corriendo como PWA instalada */
  isPWA: boolean
  /** User agent completo */
  userAgent: string | null
  /** Plataforma del dispositivo */
  platform: string
  /** Fingerprint único del dispositivo basado en características del hardware/navegador + instanceId */
  deviceFingerprint: string | null
  /** UUID único por instancia del navegador (diferencia dispositivos iguales) */
  instanceId: string | null
  /** Zona horaria del dispositivo */
  timezone: string | null
  /** Offset de zona horaria en minutos */
  timezoneOffset: number | null
  /** Idiomas preferidos del usuario */
  languages: string[] | null
  /** Información del renderizador WebGL (GPU) */
  gpuRenderer: string | null
  /** Vendor del renderizador WebGL */
  gpuVendor: string | null
  /** Profundidad de color de la pantalla */
  colorDepth: number | null
}

/**
 * Servicio para obtener información del dispositivo
 * Funciona tanto en aplicaciones nativas de Expo como en web
 */
export class DeviceService {
  /**
   * Obtiene la información del dispositivo actual
   * En web, parsea el userAgent del navegador
   * En nativo, usa expo-device
   * @returns {IDeviceInfo} Información del dispositivo
   */
  static getDeviceInfo(): IDeviceInfo {
    if (Platform.OS === 'web') {
      return this.getWebDeviceInfo()
    }
    return this.getNativeDeviceInfo()
  }

  /**
   * Obtiene información extendida del dispositivo
   * Incluye datos adicionales como resolución, idioma, conexión, etc.
   * @returns {IDeviceInfoExtended} Información extendida del dispositivo
   */
  static getDeviceInfoExtended(): IDeviceInfoExtended {
    const basicInfo = this.getDeviceInfo()
    
    if (Platform.OS === 'web') {
      return this.getWebDeviceInfoExtended(basicInfo)
    }
    return this.getNativeDeviceInfoExtended(basicInfo)
  }

  /**
   * Obtiene información extendida del dispositivo en plataformas web
   * @param {IDeviceInfo} basicInfo - Información básica del dispositivo
   * @returns {IDeviceInfoExtended} Información extendida del dispositivo
   */
  private static getWebDeviceInfoExtended(basicInfo: IDeviceInfo): IDeviceInfoExtended {
    const nav = typeof navigator !== 'undefined' ? navigator : null
    const win = typeof window !== 'undefined' ? window : null
    const scr = win?.screen || null

    // Detectar tipo de conexión
    let connectionType: string | null = null
    if (nav && 'connection' in nav) {
      const connection = (nav as Navigator & { connection?: { effectiveType?: string; type?: string } }).connection
      connectionType = connection?.effectiveType || connection?.type || null
    }

    // Detectar si es PWA
    let isPWA = false
    if (win) {
      const isStandalone = win.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = nav && 'standalone' in nav && (nav as Navigator & { standalone?: boolean }).standalone === true
      isPWA = isStandalone || Boolean(isIOSStandalone)
    }

    // Obtener información de WebGL (GPU)
    const webglInfo = this.getWebGLInfo()

    // Obtener UUID único por instancia (diferencia dispositivos iguales)
    const instanceId = this.getOrCreateInstanceId()

    // Generar fingerprint del dispositivo (incluye instanceId)
    const fingerprint = this.generateDeviceFingerprint()

    return {
      ...basicInfo,
      screenResolution: scr ? `${scr.width}x${scr.height}` : null,
      language: nav?.language || null,
      cpuCores: nav?.hardwareConcurrency || null,
      deviceMemory: nav && 'deviceMemory' in nav 
        ? (nav as Navigator & { deviceMemory?: number }).deviceMemory || null 
        : null,
      isOnline: nav?.onLine ?? true,
      connectionType,
      isTouchScreen: nav ? nav.maxTouchPoints > 0 : false,
      pixelRatio: win?.devicePixelRatio || null,
      isPWA,
      userAgent: nav?.userAgent || null,
      platform: 'web',
      deviceFingerprint: fingerprint,
      instanceId: instanceId,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      timezoneOffset: new Date().getTimezoneOffset(),
      languages: nav?.languages ? Array.from(nav.languages) : null,
      gpuRenderer: webglInfo.renderer,
      gpuVendor: webglInfo.vendor,
      colorDepth: scr?.colorDepth || null
    }
  }

  /**
   * Obtiene información del renderizador WebGL (GPU)
   * @returns {{ vendor: string | null, renderer: string | null }} Información de la GPU
   */
  private static getWebGLInfo(): { vendor: string | null; renderer: string | null } {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      
      if (!gl) {
        return { vendor: null, renderer: null }
      }

      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info')
      
      if (!debugInfo) {
        return { vendor: null, renderer: null }
      }

      return {
        vendor: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || null,
        renderer: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || null
      }
    } catch {
      return { vendor: null, renderer: null }
    }
  }

  /**
   * Genera un fingerprint único del dispositivo basado en características del hardware y navegador
   * Combina características del dispositivo con un UUID único por instancia para garantizar unicidad
   * @returns {string | null} Hash del fingerprint del dispositivo
   */
  private static generateDeviceFingerprint(): string | null {
    try {
      const nav = typeof navigator !== 'undefined' ? navigator : null
      const win = typeof window !== 'undefined' ? window : null
      const scr = win?.screen || null

      if (!nav || !win) return null

      // Recopilar características del dispositivo
      const components: string[] = []

      // ⭐ IMPORTANTE: UUID único por instancia del navegador
      // Este es el componente clave que diferencia dos dispositivos iguales
      const instanceId = this.getOrCreateInstanceId()
      components.push(instanceId)

      // User Agent
      components.push(nav.userAgent || '')

      // Idiomas
      components.push((nav.languages || []).join(','))

      // Resolución y color depth
      if (scr) {
        components.push(`${scr.width}x${scr.height}`)
        components.push(`${scr.colorDepth}`)
        components.push(`${scr.availWidth}x${scr.availHeight}`)
      }

      // Zona horaria
      components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || '')
      components.push(`${new Date().getTimezoneOffset()}`)

      // Hardware concurrency (CPU cores)
      components.push(`${nav.hardwareConcurrency || ''}`)

      // Device memory
      if ('deviceMemory' in nav) {
        components.push(`${(nav as Navigator & { deviceMemory?: number }).deviceMemory || ''}`)
      }

      // Touch support
      components.push(`${nav.maxTouchPoints}`)

      // Platform
      components.push(nav.platform || '')

      // Pixel ratio
      components.push(`${win.devicePixelRatio || ''}`)

      // WebGL info
      const webglInfo = this.getWebGLInfo()
      components.push(webglInfo.vendor || '')
      components.push(webglInfo.renderer || '')

      // Canvas fingerprint (más único)
      const canvasFingerprint = this.getCanvasFingerprint()
      if (canvasFingerprint) {
        components.push(canvasFingerprint)
      }

      // Crear hash del fingerprint
      const fingerprintString = components.join('|')
      return this.hashString(fingerprintString)
    } catch {
      return null
    }
  }

  /**
   * Genera un fingerprint basado en el renderizado de canvas
   * Cada dispositivo/navegador renderiza de manera ligeramente diferente
   * @returns {string | null} Fingerprint del canvas
   */
  private static getCanvasFingerprint(): string | null {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 200
      canvas.height = 50
      const ctx = canvas.getContext('2d')
      
      if (!ctx) return null

      // Renderizar texto con diferentes estilos
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('Device Fingerprint', 2, 15)
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
      ctx.fillText('Device Fingerprint', 4, 17)

      // Obtener los datos del canvas como string
      return canvas.toDataURL().slice(-50) // Solo los últimos 50 caracteres para reducir tamaño
    } catch {
      return null
    }
  }

  /**
   * Genera un hash simple de una cadena (djb2 algorithm)
   * @param {string} str - Cadena a hashear
   * @returns {string} Hash en hexadecimal
   */
  private static hashString(str: string): string {
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i)
      hash = hash & hash // Convertir a 32-bit integer
    }
    // Convertir a hexadecimal positivo
    return (hash >>> 0).toString(16).padStart(8, '0')
  }

  /**
   * Obtiene información extendida del dispositivo en plataformas nativas
   * @param {IDeviceInfo} basicInfo - Información básica del dispositivo
   * @returns {IDeviceInfoExtended} Información extendida del dispositivo
   */
  private static getNativeDeviceInfoExtended(basicInfo: IDeviceInfo): IDeviceInfoExtended {
    // En dispositivos nativos, usar el deviceId de expo-device como fingerprint
    // En nativo, usar osBuildId o modelId como fingerprint base
    // Estos son únicos por dispositivo en la mayoría de casos
    const nativeFingerprint = Device.osBuildId || Device.modelId || null
    
    return {
      ...basicInfo,
      screenResolution: null, // Requiere Dimensions de react-native
      language: null, // Requiere expo-localization
      cpuCores: Device.supportedCpuArchitectures?.length || null,
      deviceMemory: Device.totalMemory ? Math.round(Device.totalMemory / (1024 * 1024 * 1024)) : null, // Convertir a GB
      isOnline: true, // Requiere NetInfo
      connectionType: null, // Requiere NetInfo
      isTouchScreen: true, // Dispositivos móviles siempre tienen touch
      pixelRatio: null, // Requiere PixelRatio de react-native
      isPWA: false,
      userAgent: null,
      platform: Platform.OS,
      deviceFingerprint: nativeFingerprint,
      instanceId: nativeFingerprint, // En nativo, usar el mismo ID del dispositivo
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      timezoneOffset: new Date().getTimezoneOffset(),
      languages: null, // Requiere expo-localization
      gpuRenderer: null, // No disponible en nativo
      gpuVendor: null, // No disponible en nativo
      colorDepth: null // No disponible en nativo
    }
  }

  /**
   * Obtiene información del dispositivo en plataformas web
   * @returns {IDeviceInfo} Información del dispositivo desde el navegador
   */
  private static getWebDeviceInfo(): IDeviceInfo {
    if (typeof navigator === 'undefined' || !navigator.userAgent) {
      return {
        deviceModel: 'Web Browser',
        deviceBrand: 'Unknown',
        deviceType: 'Web',
        deviceOs: 'Unknown'
      }
    }

    const userAgent = navigator.userAgent
    const browserInfo = this.parseBrowserInfo(userAgent)
    const osInfo = this.parseOsInfo(userAgent)
    const deviceType = this.parseDeviceType(userAgent)
    const deviceBrand = this.parseDeviceBrand(userAgent)

    return {
      deviceModel: browserInfo.name,
      deviceBrand: deviceBrand,
      deviceType: deviceType,
      deviceOs: osInfo
    }
  }

  /**
   * Determina el fabricante del dispositivo basado en el sistema operativo
   * @param {string} userAgent - User agent string del navegador
   * @returns {string} Fabricante del dispositivo
   */
  private static parseDeviceBrand(userAgent: string): string {
    // iOS devices (iPhone, iPad, iPod)
    if (this.isIOS() || /iPhone|iPad|iPod/.test(userAgent)) {
      return 'Apple'
    }

    // macOS
    if (userAgent.includes('Mac OS X') || userAgent.includes('Macintosh')) {
      return 'Apple'
    }

    // Windows - puede ser varias marcas, pero el "brand" del SO es Microsoft
    if (userAgent.includes('Windows')) {
      return 'Microsoft'
    }

    // Android - intentar detectar marca específica
    if (userAgent.includes('Android')) {
      // Samsung
      if (userAgent.includes('Samsung') || userAgent.includes('SM-')) {
        return 'Samsung'
      }
      // Xiaomi
      if (userAgent.includes('Xiaomi') || userAgent.includes('Redmi') || userAgent.includes('POCO')) {
        return 'Xiaomi'
      }
      // Huawei
      if (userAgent.includes('Huawei') || userAgent.includes('HUAWEI')) {
        return 'Huawei'
      }
      // Google Pixel
      if (userAgent.includes('Pixel')) {
        return 'Google'
      }
      // OnePlus
      if (userAgent.includes('OnePlus')) {
        return 'OnePlus'
      }
      // Motorola
      if (userAgent.includes('Motorola') || userAgent.includes('moto')) {
        return 'Motorola'
      }
      // LG
      if (userAgent.includes('LG')) {
        return 'LG'
      }
      // Sony
      if (userAgent.includes('Sony') || userAgent.includes('Xperia')) {
        return 'Sony'
      }
      // OPPO
      if (userAgent.includes('OPPO')) {
        return 'OPPO'
      }
      // Vivo
      if (userAgent.includes('vivo')) {
        return 'Vivo'
      }
      // Por defecto para Android
      return 'Android Device'
    }

    // Chrome OS
    if (userAgent.includes('CrOS')) {
      return 'Google'
    }

    // Linux genérico
    if (userAgent.includes('Linux')) {
      return 'Linux'
    }

    return 'Unknown'
  }

  /**
   * Obtiene información del dispositivo en plataformas nativas
   * @returns {IDeviceInfo} Información del dispositivo desde expo-device
   */
  private static getNativeDeviceInfo(): IDeviceInfo {
    return {
      deviceModel: Device.modelName,
      deviceBrand: Device.brand,
      deviceType: Device.deviceName,
      deviceOs: `${Device.osName} ${Device.osVersion}`
    }
  }

  /**
   * Parsea la información del navegador desde el userAgent
   * @param {string} userAgent - User agent string del navegador
   * @returns {{ name: string, vendor: string }} Información del navegador
   */
  private static parseBrowserInfo(userAgent: string): { name: string; vendor: string } {
    let name = 'Unknown Browser'
    let vendor = 'Unknown'

    // Detectar navegadores comunes
    if (userAgent.includes('Edg/')) {
      name = 'Microsoft Edge'
      vendor = 'Microsoft'
      const match = userAgent.match(/Edg\/([\d.]+)/)
      if (match) name += ` ${match[1]}`
    } else if (userAgent.includes('Chrome/') && !userAgent.includes('Chromium')) {
      name = 'Google Chrome'
      vendor = 'Google'
      const match = userAgent.match(/Chrome\/([\d.]+)/)
      if (match) name += ` ${match[1]}`
    } else if (userAgent.includes('Firefox/')) {
      name = 'Mozilla Firefox'
      vendor = 'Mozilla'
      const match = userAgent.match(/Firefox\/([\d.]+)/)
      if (match) name += ` ${match[1]}`
    } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
      name = 'Safari'
      vendor = 'Apple'
      const match = userAgent.match(/Version\/([\d.]+)/)
      if (match) name += ` ${match[1]}`
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR/')) {
      name = 'Opera'
      vendor = 'Opera Software'
      const match = userAgent.match(/(?:Opera|OPR)\/([\d.]+)/)
      if (match) name += ` ${match[1]}`
    }

    return { name, vendor }
  }

  /**
   * Detecta si el dispositivo es iOS (iPhone/iPad) incluso con User Agent de escritorio
   * Safari en iOS 13+ puede mostrar UA de macOS por defecto
   * @returns {boolean} True si es iOS
   */
  private static isIOS(): boolean {
    if (typeof navigator === 'undefined') return false
    
    const userAgent = navigator.userAgent
    const nav = navigator as Navigator & { standalone?: boolean }
    
    // Detección directa por UA
    if (/iPhone|iPad|iPod/.test(userAgent)) {
      return true
    }
    
    // Detección por navigator.standalone (solo existe en Safari iOS)
    if ('standalone' in nav) {
      return true
    }
    
    // Detección para iPhone/iPad con UA de escritorio (iOS 13+)
    // Safari en iOS con "Solicitar sitio de escritorio" muestra UA de Mac
    // Pero tiene touchscreen
    if (userAgent.includes('Mac OS X') || userAgent.includes('Macintosh')) {
      const hasTouch = navigator.maxTouchPoints > 0
      
      // Mac real NO tiene touchscreen (maxTouchPoints = 0)
      // iPhone/iPad SÍ tienen touchscreen (maxTouchPoints > 0)
      if (hasTouch) {
        return true
      }
    }
    
    // Detección adicional: Safari móvil tiene "Mobile" o "Version/" con touch
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      const hasTouch = navigator.maxTouchPoints > 0
      if (hasTouch && userAgent.includes('Version/')) {
        // Es Safari con touch, probablemente iOS
        return true
      }
    }
    
    return false
  }

  /**
   * Parsea la información del sistema operativo desde el userAgent
   * @param {string} userAgent - User agent string del navegador
   * @returns {string} Nombre y versión del sistema operativo
   */
  private static parseOsInfo(userAgent: string): string {
    // Primero detectar iOS (antes de macOS porque iPad/iPhone puede tener UA de Mac)
    if (this.isIOS()) {
      // PRIORIZAR la versión de Safari porque es más confiable
      // Safari en iOS siempre tiene la misma versión que el sistema operativo
      // El "CPU iPhone OS" en el UA puede estar desactualizado o ser incorrecto
      const safariVersionMatch = userAgent.match(/Version\/([\d.]+)/)
      if (safariVersionMatch) {
        return `iOS ${safariVersionMatch[1]}`
      }
      
      // Fallback: intentar obtener versión de iOS del UA (iPhone OS X_Y_Z o CPU iPhone OS X_Y_Z)
      const iosMatch = userAgent.match(/(?:iPhone OS|CPU (?:iPhone )?OS) ([\d_]+)/)
      if (iosMatch) {
        const version = iosMatch[1].replace(/_/g, '.')
        return `iOS ${version}`
      }
      
      return 'iOS'
    }

    // Windows
    if (userAgent.includes('Windows NT 10.0')) {
      return 'Windows 10/11'
    } else if (userAgent.includes('Windows NT 6.3')) {
      return 'Windows 8.1'
    } else if (userAgent.includes('Windows NT 6.2')) {
      return 'Windows 8'
    } else if (userAgent.includes('Windows NT 6.1')) {
      return 'Windows 7'
    } else if (userAgent.includes('Windows')) {
      return 'Windows'
    }

    // macOS (solo si no es iOS)
    if (userAgent.includes('Mac OS X')) {
      const match = userAgent.match(/Mac OS X ([\d_]+)/)
      if (match) {
        const version = match[1].replace(/_/g, '.')
        return `macOS ${version}`
      }
      return 'macOS'
    }

    // Android
    if (userAgent.includes('Android')) {
      const match = userAgent.match(/Android ([\d.]+)/)
      if (match) {
        return `Android ${match[1]}`
      }
      return 'Android'
    }

    // Linux
    if (userAgent.includes('Linux')) {
      return 'Linux'
    }

    // Chrome OS
    if (userAgent.includes('CrOS')) {
      return 'Chrome OS'
    }

    return 'Unknown OS'
  }

  /**
   * Determina el tipo de dispositivo desde el userAgent
   * @param {string} userAgent - User agent string del navegador
   * @returns {string} Tipo de dispositivo (Mobile, Tablet, Desktop, etc.)
   */
  private static parseDeviceType(userAgent: string): string {
    // Detectar dispositivos móviles específicos
    if (userAgent.includes('iPhone')) {
      return 'iPhone'
    }
    if (userAgent.includes('iPad')) {
      return 'iPad'
    }
    
    // Detectar iPad con UA de escritorio (iPadOS 13+)
    if (this.isIOS() && !userAgent.includes('iPhone')) {
      return 'iPad'
    }
    
    // Detectar iPhone con UA de escritorio (raro pero posible)
    if (this.isIOS()) {
      return 'iPhone'
    }
    
    // Detectar Android tablets vs phones
    if (userAgent.includes('Android')) {
      if (userAgent.includes('Mobile')) {
        return 'Android Phone'
      }
      return 'Android Tablet'
    }

    // Detectar otros móviles
    if (/Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'Mobile'
    }

    // Detectar tablets genéricos
    if (/Tablet|PlayBook/i.test(userAgent)) {
      return 'Tablet'
    }

    // Por defecto, desktop
    return 'Desktop'
  }

  /**
   * Obtiene o genera un UUID único por instancia del navegador
   * Este UUID se almacena en localStorage y es único por dispositivo/navegador
   * @returns {string} UUID único de la instancia
   */
  private static getOrCreateInstanceId(): string {
    const INSTANCE_KEY = 'device_instance_id'
    const win = typeof window !== 'undefined' ? window : null
    
    try {
      if (!win || typeof win.localStorage === 'undefined') {
        return this.generateSimpleUUID()
      }
      
      let instanceId = win.localStorage.getItem(INSTANCE_KEY)
      
      if (!instanceId) {
        instanceId = this.generateSimpleUUID()
        win.localStorage.setItem(INSTANCE_KEY, instanceId)
      }
      
      return instanceId
    } catch {
      // Si localStorage no está disponible, generar uno temporal
      return this.generateSimpleUUID()
    }
  }

  /**
   * Genera un UUID simple usando crypto API o Math.random como fallback
   * @returns {string} UUID generado
   */
  private static generateSimpleUUID(): string {
    try {
      const win = typeof window !== 'undefined' ? window : null
      
      // Usar crypto API si está disponible
      if (win?.crypto?.randomUUID) {
        return win.crypto.randomUUID()
      }
      
      // Fallback con crypto.getRandomValues
      if (win?.crypto?.getRandomValues) {
        const bytes = new Uint8Array(16)
        win.crypto.getRandomValues(bytes)
        bytes[6] = (bytes[6] & 0x0f) | 0x40
        bytes[8] = (bytes[8] & 0x3f) | 0x80
        const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
      }
    } catch {
      // Ignorar errores y usar fallback
    }
    
    // Fallback con Math.random
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }
}

