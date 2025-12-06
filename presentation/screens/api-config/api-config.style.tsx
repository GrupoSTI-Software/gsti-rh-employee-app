import { Dimensions, StyleSheet } from 'react-native'
import { IAppTheme } from '../../theme/app-theme.interface'
import { useAppTheme } from '../../theme/theme-context'
import { EThemeType } from '../../theme/types/theme-type.enum'

const { width, height: screenHeight } = Dimensions.get('window')
const hp = (percentage: number) => (screenHeight * percentage) / 100
const wp = (percentage: number) => (width * percentage) / 100

/**
 * Función que crea los estilos para la pantalla de configuración del api
 * @param {IAppTheme} theme - Tema actual de la aplicación
 * @param {EThemeType} themeType - Tipo de tema (light o dark)
 * @returns {Object} Estilos de la pantalla de configuración
 */
const createApiConfigStyle = (theme: IAppTheme, themeType: EThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeType === EThemeType.LIGHT ? '#FFFFFF' : theme.colors.background,
      padding: wp(4),
      marginTop: 30
    },
    safeArea: {
      flex: 1,
      backgroundColor: themeType === EThemeType.LIGHT ? '#FFFFFF' : theme.colors.background
    },
    scrollContent: {
      flexGrow: 1
    },
    header: {
      marginBottom: hp(3.6),
      flexDirection: 'column',
      justifyContent: 'flex-start',
      textAlign: 'left'
    },
    title: {
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: hp(1),
      textAlign: 'left'
    },
    subtitle: {
      color: theme.colors.textSecondary
    },
    label: {
      fontSize: 16,
      marginBottom: 6
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      color: themeType === EThemeType.LIGHT ? '#000000ff' : '#FFFFFF',
      padding: 10,
      borderRadius: 6,
      marginBottom: 20,
      marginTop: 5
    }
  })

/**
 * Hook personalizado que retorna los estilos de la pantalla de configuración del api
 * @returns {Object} Estilos de la pantalla de configuración del api
 */
const useApiConfigStyle = () => {
  const { theme, themeType } = useAppTheme()
  return createApiConfigStyle(theme, themeType)
}

export default useApiConfigStyle 
