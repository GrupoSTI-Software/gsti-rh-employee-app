/* eslint-disable no-undef */
import { Platform } from 'react-native'

/**
 * Polyfill para expo-secure-store en web
 * Usa localStorage como alternativa (menos seguro pero funcional)
 */

const PREFIX = 'secure_store_'

// Importar el módulo nativo solo si no estamos en web
let NativeSecureStore: typeof import('expo-secure-store') | null = null

if (Platform.OS !== 'web') {
  NativeSecureStore = require('expo-secure-store') as typeof import('expo-secure-store')
}

/**
 * Obtiene un valor del almacenamiento
 * @param key - Clave del valor a obtener
 * @returns El valor almacenado o null si no existe
 */
export async function getItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(`${PREFIX}${key}`)
    } catch {
      return null
    }
  }
  if (NativeSecureStore) {
    return NativeSecureStore.getItemAsync(key)
  }
  return null
}

/**
 * Guarda un valor en el almacenamiento
 * @param key - Clave del valor a guardar
 * @param value - Valor a guardar
 * @param options - Opciones adicionales (ignoradas en web)
 */
export async function setItemAsync(key: string, value: string, options?: unknown): Promise<void> {
  void options // Ignorar opciones en web
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(`${PREFIX}${key}`, value)
    } catch {
      // localStorage no disponible
    }
    return
  }
  if (NativeSecureStore) {
    return NativeSecureStore.setItemAsync(key, value)
  }
}

/**
 * Elimina un valor del almacenamiento
 * @param key - Clave del valor a eliminar
 */
export async function deleteItemAsync(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(`${PREFIX}${key}`)
    } catch {
      // localStorage no disponible
    }
    return
  }
  if (NativeSecureStore) {
    return NativeSecureStore.deleteItemAsync(key)
  }
}

// Constantes exportadas para compatibilidad
export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY'
export const AFTER_FIRST_UNLOCK = 'AFTER_FIRST_UNLOCK'
export const ALWAYS = 'ALWAYS'
export const ALWAYS_THIS_DEVICE_ONLY = 'ALWAYS_THIS_DEVICE_ONLY'
export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = 'WHEN_PASSCODE_SET_THIS_DEVICE_ONLY'
export const WHEN_UNLOCKED = 'WHEN_UNLOCKED'
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 'WHEN_UNLOCKED_THIS_DEVICE_ONLY'
