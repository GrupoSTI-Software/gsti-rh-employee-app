import * as Random from 'expo-random'
import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'device_token'

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

export async function getOrCreateDeviceToken() {
  try {
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
