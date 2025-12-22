import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as SecureStore from '../../../src/shared/infrastructure/platform/secure-store.web'
import { useEffect, useState } from 'react'
import { RootStackParamList } from '../../../navigation/types/types'
import { AuthStateController } from '../../../src/features/authentication/infrastructure/controllers/auth-state.controller'
import { ClearSessionController } from '../../../src/features/authentication/infrastructure/controllers/clear-seassion.controller'
import { environment } from '../../../config/environment'
/**
 * Controlador de la pantalla de configuración del api
 * @description Gestiona la lógica de negocio para configurar la dirección del API
 * @returns {Object} Objeto con los datos y funciones accesibles desde la pantalla
 */
export const ApiConfigScreenController = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const STORAGE_KEY = 'API_URL'
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  useEffect(() => {
    checkAuthState().catch(console.error)
  }, [])

  const checkAuthState = async () => {
    try {
      const authStateController = new AuthStateController()
      const authState = await authStateController.getAuthState()

      if (authState?.props.authState?.isAuthenticated) {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Error checking auth state:', error)
    }
  }
  
  // Obtener URL del environment (.env) como fuente de verdad
  const  loadApi = async (): Promise<string | null> => {
    try {
      // Siempre usar la URL del environment (.env) como fuente de verdad
      const envApiUrl = environment.API_URL
      
      if (envApiUrl && envApiUrl !== 'NOT ASSIGNED') {
        // Guardar/actualizar en SecureStore para que otros servicios la usen
        await SecureStore.setItemAsync(STORAGE_KEY, envApiUrl)
        return envApiUrl
      }
      
      // Fallback: obtener del SecureStore si no hay en environment
      const storedUrl = await SecureStore.getItemAsync(STORAGE_KEY)
      if (storedUrl) {
        return storedUrl
      }
      
      return null
    } catch (error) {
      console.error('Error cargando API URL:', error)
      return null
    }
  }

  // Guardar URL
  const  saveApiUrl = async (url: string): Promise<boolean> => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, url)
      return true
    } catch (error) {
      console.error('Error guardando API URL:', error)
      return false
    }
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch (error) {
      console.error('url no valida', error)
      return false
    }
  }

  const handleLogout = async () => {
    const clearSessionController = new ClearSessionController()
    await clearSessionController.clearSession()
    navigation.replace('authenticationScreen')
  }

  
  const goBack = () => {
    setTimeout(() => {
      navigation.navigate('authenticationScreen')
    }, 300)
  }

  return {
    isAuthenticated,
    // Funciones
    saveApiUrl,
    loadApi,
    isValidUrl,
    goBack,
    handleLogout
  }
}
