import * as SecureStore from '../../src/shared/infrastructure/platform/secure-store.web'
import { environment } from '../../config/environment'

/**
 * Obtiene la url del Api
 * @returns {string} Url de la Api o null si no existe
*/
export const getApi = async (): Promise<string | null> => {
  try {
    // Siempre usar la URL del environment (.env) como fuente de verdad
    const envApiUrl = environment.API_URL
    
    if (envApiUrl && envApiUrl !== 'NOT ASSIGNED') {
      // Guardar/actualizar en SecureStore para que otros servicios la usen
      await SecureStore.setItemAsync('API_URL', envApiUrl)
      return envApiUrl
    }
    
    // Fallback: obtener del SecureStore si no hay en environment
    const storedUrl = await SecureStore.getItemAsync('API_URL')
    if (storedUrl) {
      return storedUrl
    }
    
    return null
  } catch (error) {
    console.error('Error cargando API URL:', error)
    return ''
  }
}
