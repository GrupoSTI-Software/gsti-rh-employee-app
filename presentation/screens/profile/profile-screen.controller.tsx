import { useEffect, useMemo, useState } from 'react'
import { IAuthState } from '../../../src/features/authentication/domain/types/auth-state.interface'
import { AuthStateController } from '../../../src/features/authentication/infrastructure/controllers/auth-state.controller'
import { useAppTheme } from '../../theme/theme-context'
import { EThemeType } from '../../theme/types/theme-type.enum'

/**
 * Controlador de la pantalla de perfil
 * @description Gestiona la lógica de negocio para mostrar la información del perfil del usuario
 * @returns {Object} Objeto con los datos y funciones accesibles desde la pantalla de perfil
 */
export const ProfileScreenController = () => {
  const [authState, setAuthState] = useState<IAuthState | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const authStateController = useMemo(() => new AuthStateController(), [])
  
  const { themeType } = useAppTheme()

  useEffect(() => {
    void loadUserProfile()
  }, [])

  /**
   * Carga el perfil del usuario desde el estado de autenticación
   * @returns {Promise<void>}
   */
  const loadUserProfile = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      const authEntity = await authStateController.getAuthState()
      
      if (authEntity && authEntity.props.authState) {
        setAuthState(authEntity.props.authState)
      } else {
        setError('No se encontró información de autenticación')
      }
    } catch (err) {
      setError('Error al cargar el perfil del usuario')
      console.error('Error loading user profile:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtiene el tipo de tema actual como string
   * @returns {string} El tipo de tema actual ('light' o 'dark')
   */
  const getThemeType = (): string => {
    return themeType === EThemeType.LIGHT ? 'light' : 'dark'
  }

  /**
   * Formatea una fecha para mostrar en la UI
   * @param {Date | string | null} date - Fecha a formatear
   * @returns {string} Fecha formateada o '---'
   */
  const formatDate = (date: Date | string | null): string => {
    if (!date) return '---'
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return '---'
    }
  }

  return {
    // Estado
    authState,
    loading,
    error,
    themeType: getThemeType(),
    
    // Funciones
    loadUserProfile,
    formatDate
  }
} 
