import { useEffect, useState } from 'react'
import { AuthStateController } from '../src/features/authentication/infrastructure/controllers/auth-state.controller'
import { RootStackParamList } from './types/types'

const AppNavigatorController = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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
    } finally {
      setIsLoading(false)
    }
  }

  const getInitialRouteName = (): keyof RootStackParamList => {
    return isAuthenticated ? 'faceScreen' : 'faceScreen'
  }

  return {
    isLoading,
    isAuthenticated,
    getInitialRouteName
  }
}

export default AppNavigatorController
