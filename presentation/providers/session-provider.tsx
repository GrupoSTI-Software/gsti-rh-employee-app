import { useNavigation, NavigationProp } from '@react-navigation/native'
import React, { useEffect } from 'react'
import { RootStackParamList } from '../../navigation/types/types'
import { SessionService } from '../../src/shared/infrastructure/services/session-service'

interface SessionProviderProps {
  children: React.ReactNode
}

/**
 * Provider que configura el manejador de navegación para el SessionService
 * Debe estar dentro del NavigationContainer para tener acceso a la navegación
 */
export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  useEffect(() => {
    // Configurar el interceptor global de axios para manejar errores 401
    SessionService.setupGlobalAxiosInterceptor()

    // Registrar el manejador de navegación al login
    const navigateToLogin = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'authenticationScreen' }]
      })
    }

    SessionService.setNavigateToLoginHandler(navigateToLogin)

    // Limpiar al desmontar
    return () => {
      SessionService.clearNavigateToLoginHandler()
    }
  }, [navigation])

  return <>{children}</>
}

