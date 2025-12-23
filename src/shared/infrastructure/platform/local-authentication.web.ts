import { Platform } from 'react-native'

/**
 * Polyfill para expo-local-authentication en web
 * La biometría no está disponible en navegadores, así que retornamos valores por defecto
 */

// Tipos de autenticación
export enum AuthenticationType {
  FINGERPRINT = 1,
  FACIAL_RECOGNITION = 2,
  IRIS = 3
}

// Niveles de seguridad
export enum SecurityLevel {
  NONE = 0,
  SECRET = 1,
  BIOMETRIC_WEAK = 2,
  BIOMETRIC_STRONG = 3,
  BIOMETRIC = 2 // Alias para compatibilidad con expo-local-authentication
}

// Resultado de la autenticación
export interface AuthenticationResult {
  success: boolean
  error?: string
  warning?: string
}

// Importar el módulo nativo solo si no estamos en web
let NativeLocalAuth: typeof import('expo-local-authentication') | null = null

if (Platform.OS !== 'web') {
  NativeLocalAuth = require('expo-local-authentication') as typeof import('expo-local-authentication')
}

/**
 * Verifica si el hardware biométrico está disponible
 * @returns false en web
 */
export async function hasHardwareAsync(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false
  }
  if (NativeLocalAuth) {
    return NativeLocalAuth.hasHardwareAsync()
  }
  return false
}

/**
 * Verifica si hay biometría registrada
 * @returns false en web
 */
export async function isEnrolledAsync(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false
  }
  if (NativeLocalAuth) {
    return NativeLocalAuth.isEnrolledAsync()
  }
  return false
}

/**
 * Obtiene los tipos de autenticación soportados
 * @returns array vacío en web
 */
export async function supportedAuthenticationTypesAsync(): Promise<AuthenticationType[]> {
  if (Platform.OS === 'web') {
    return []
  }
  if (NativeLocalAuth) {
    return NativeLocalAuth.supportedAuthenticationTypesAsync()
  }
  return []
}

/**
 * Obtiene el nivel de seguridad registrado
 * @returns NONE en web
 */
export async function getEnrolledLevelAsync(): Promise<SecurityLevel> {
  if (Platform.OS === 'web') {
    return SecurityLevel.NONE
  }
  if (NativeLocalAuth) {
    return NativeLocalAuth.getEnrolledLevelAsync()
  }
  return SecurityLevel.NONE
}

/**
 * Realiza la autenticación biométrica
 * @param options - Opciones de autenticación (ignoradas en web)
 * @returns resultado fallido en web
 */
export async function authenticateAsync(options?: {
  promptMessage?: string
  fallbackLabel?: string
  disableDeviceFallback?: boolean
  cancelLabel?: string
}): Promise<AuthenticationResult> {
  void options // Ignorar opciones en web
  if (Platform.OS === 'web') {
    return {
      success: false,
      error: 'La autenticación biométrica no está disponible en navegadores web'
    }
  }
  if (NativeLocalAuth) {
    return NativeLocalAuth.authenticateAsync(options)
  }
  return {
    success: false,
    error: 'Módulo de autenticación local no disponible'
  }
}
