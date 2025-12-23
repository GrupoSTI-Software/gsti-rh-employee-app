/* eslint-disable no-undef */
import { Platform } from 'react-native'

/**
 * Polyfill para expo-random en web
 * Usa crypto.getRandomValues como alternativa
 */

// Importar el módulo nativo solo si no estamos en web
let NativeRandom: typeof import('expo-random') | null = null

if (Platform.OS !== 'web') {
  NativeRandom = require('expo-random') as typeof import('expo-random')
}

/**
 * Obtiene bytes aleatorios
 * @param byteCount - Cantidad de bytes a generar
 * @returns Uint8Array con bytes aleatorios
 */
export function getRandomBytes(byteCount: number): Uint8Array {
  if (Platform.OS === 'web') {
    const bytes = new Uint8Array(byteCount)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes)
    } else {
      // Fallback menos seguro para navegadores muy antiguos
      for (let i = 0; i < byteCount; i++) {
        bytes[i] = Math.floor(Math.random() * 256)
      }
    }
    return bytes
  }
  if (NativeRandom) {
    return NativeRandom.getRandomBytes(byteCount)
  }
  // Fallback
  const bytes = new Uint8Array(byteCount)
  for (let i = 0; i < byteCount; i++) {
    bytes[i] = Math.floor(Math.random() * 256)
  }
  return bytes
}

/**
 * Obtiene bytes aleatorios de forma asíncrona
 * @param byteCount - Cantidad de bytes a generar
 * @returns Promise que resuelve a Uint8Array con bytes aleatorios
 */
export async function getRandomBytesAsync(byteCount: number): Promise<Uint8Array> {
  return getRandomBytes(byteCount)
}
