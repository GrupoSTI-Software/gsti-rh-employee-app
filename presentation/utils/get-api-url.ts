import * as SecureStore from 'expo-secure-store'

/**
 * Obtiene la url del Api
 * @returns {string} Url de la Api o null si no existe
*/
export const getApi = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('API_URL')
  } catch (error) {
    console.error('Error cargando API URL:', error)
    return ''
  }
}
