import { useEffect, useState } from 'react'
import { AuthStateController } from '../../../src/features/authentication/infrastructure/controllers/auth-state.controller'

/**
 * Controlador del header del layout
 * @returns {Object} Propiedades y funciones accesibles desde la UI
 * @property {string} authUserName - Nombre del usuario autenticado
 * @property {string} authUserAvatarType - Tipo de avatar (image o text)
 * @property {string} authUserAvatarSource - Fuente del avatar
 */ 
const HeaderLayoutController = () => {
  const [authUserAvatarType, setAuthUserAvatarType] = useState<string>('text')
  const [authUserAvatarSource, setAuthUserAvatarSource] = useState<string>('')
  const [authUserName, setAuthUserName] = useState<string>('')

  useEffect(() => {    
    void loadUserData()
  }, [])

  /**
   * Carga los datos del usuario de la sesión actual
   * @returns {Promise<void>}
   */
  const loadUserData = async (): Promise<void> => {
    const authStateController = new AuthStateController()
    const authState = await authStateController.getAuthState()
    
    // Obtener nombre de usuario
    const userName = authState?.props.authState?.user?.props.person?.props.firstname || ''
    setAuthUserName(userName)
    
    // Obtener avatar
    const avatar = authState?.props.authState?.user?.props?.person?.props?.employee?.props?.photo || ''
    const initial = authState?.props.authState?.user?.props?.person?.props?.firstname?.charAt(0).toUpperCase() || ''

    setAuthUserAvatarType(avatar ? 'image' : 'text')
    setAuthUserAvatarSource(avatar || initial)
  }

  return {
    authUserAvatarType,
    authUserAvatarSource,
    authUserName
  }
}

export default HeaderLayoutController
