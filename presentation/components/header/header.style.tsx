import { Dimensions, StyleSheet } from 'react-native'
import { IAppTheme } from '../../theme/app-theme.interface'
import { useAppTheme } from '../../theme/theme-context'
import { EThemeType } from '../../theme/types/theme-type.enum'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

// Helper functions for responsive sizing
const wp = (percentage: number) => (screenWidth * percentage) / 100
const hp = (percentage: number) => (screenHeight * percentage) / 100
const sp = (size: number) => (screenWidth / 375) * size // Scale based on iPhone X width as reference

const createHeaderLayoutStyle = (theme: IAppTheme, themeType: EThemeType) =>
  StyleSheet.create({
    safeArea: {
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: themeType === EThemeType.LIGHT ? '#f1f5f9' : '#303e67'
    },
    header: {
      height: hp(12), // 12% de la altura de la pantalla
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: wp(4), // 4% del ancho de la pantalla
      backgroundColor: 'transparent'
    },
    menuButton: {
      width: wp(13), // 13% del ancho de la pantalla
      height: wp(13), // Mantener aspecto cuadrado
      borderRadius: wp(6.5), // Mitad del ancho para círculo perfecto
      backgroundColor: themeType === EThemeType.LIGHT ? '#fff' : '#2b3652',
      alignItems: 'center',
      justifyContent: 'center'
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeType === EThemeType.LIGHT ? '#fff' : '#2b3652',
      borderRadius: wp(6.5), // 6.5% del ancho de la pantalla
      paddingRight: wp(2), // 2% del ancho de la pantalla
      paddingLeft: wp(4), // 4% del ancho de la pantalla
      paddingVertical: hp(1) // 1% de la altura de la pantalla
    },
    greeting: {
      fontWeight: '500',
      marginRight: wp(3), // 3% del ancho de la pantalla
      color: theme.colors.iconColor
    },
    avatar: {
      width: wp(9.5), // 9.5% del ancho de la pantalla
      height: wp(9.5), // Mantener aspecto cuadrado
      borderRadius: wp(4.75), // Mitad del ancho para círculo perfecto
      backgroundColor: 'rgb(210, 237, 248)'
    },
    avatarTextWrapper: {
      width: wp(9.5), // 9.5% del ancho de la pantalla
      height: wp(9.5), // Mantener aspecto cuadrado
      borderRadius: wp(4.75), // Mitad del ancho para círculo perfecto
      borderWidth: 2,
      borderColor: 'rgb(210, 237, 248)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgb(210, 237, 248)'
    },
    avatarText: {
      fontSize: sp(12), // Escala basada en referencia iPhone X
      fontWeight: 'bold',
      color: '#333'
    },
    sidebarIconColor: {
      color: theme.colors.iconColor
    }
  })

const useHeaderLayoutStyle = () => {
  const { theme } = useAppTheme()
  const { themeType } = useAppTheme()
  return createHeaderLayoutStyle(theme, themeType)
}

export default useHeaderLayoutStyle
