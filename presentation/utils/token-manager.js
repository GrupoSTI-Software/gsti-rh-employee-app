import * as Random from '../../src/shared/infrastructure/platform/random.web'
import * as SecureStore from '../../src/shared/infrastructure/platform/secure-store.web'
import { DeviceService } from '../../src/shared/infrastructure/services/device-service'

const TOKEN_KEY = 'device_token'

/**
 * Genera un UUID v4 como fallback
 * @returns {string} UUID v4
 */
function generateUUIDv4() {
  const bytes = Random.getRandomBytes(16)

  // RFC 4122 version 4 UUID adjustments
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')

  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20)
  ].join('-')
}

/**
 * Obtiene o crea un token único del dispositivo
 * Prioriza el fingerprint del dispositivo porque es más persistente
 * Si no está disponible, usa un UUID almacenado localmente
 * @returns {Promise<string | null>} Token del dispositivo
 */
export async function getOrCreateDeviceToken() {
  try {
    // Primero intentar obtener el fingerprint del dispositivo (más persistente)
    const deviceInfo = DeviceService.getDeviceInfoExtended()
    
    if (deviceInfo.deviceFingerprint) {
      // El fingerprint es persistente y no depende del almacenamiento local
      return deviceInfo.deviceFingerprint
    }

    // Fallback: usar UUID almacenado localmente
    let token = await SecureStore.getItemAsync(TOKEN_KEY)

    if (!token) {
      token = generateUUIDv4()

      await SecureStore.setItemAsync(TOKEN_KEY, token, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY
      })
    }

    return token
  } catch (error) {
    console.error('Error generating token', error)
    return null
  }
}
