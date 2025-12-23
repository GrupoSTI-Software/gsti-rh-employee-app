import { Dimensions, StyleSheet } from 'react-native'
import { IAppTheme } from '../../theme/app-theme.interface'
import { useAppTheme } from '../../theme/theme-context'
import { EThemeType } from '../../theme/types/theme-type.enum'

const { height, width } = Dimensions.get('window')

const createAuthenticationStyle = (theme: IAppTheme, themeType: EThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeType === EThemeType.LIGHT ? '#FFFFFF' : theme.colors.background
    },
    flexContainer: {
      flex: 1
    },
    safeAreaContent: {
      flex: 1,
      backgroundColor: themeType === EThemeType.LIGHT ? '#FFFFFF' : theme.colors.background
    },
    scrollContent: {
      flexGrow: 1,
      padding: 24,
      paddingBottom: 40,
      minHeight: height - 250
    },
    logoImage: {
      width: '60%',
      height: 120,
      resizeMode: 'contain',
      alignSelf: 'center',
      marginTop: 60,
      marginBottom: 20
    },
    backButton: {
      position: 'absolute',
      left: 20,
      top: 50
    },
    backButtonText: {
      color: 'white',
      fontSize: 28,
      fontWeight: 'bold'
    },
    logoContainer: {
      width: width * 0.35,
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      position: 'absolute',
      marginLeft: width * -0.35,
      marginBottom: height * -0.1,
      zIndex: 10
    },
    logoText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: 'white'
    },
    formContainer: {
      flex: 1,
      marginTop: 30,
      paddingHorizontal: 10,
      justifyContent: 'flex-start'
    },
    title: {
      fontSize: width * 0.05,
      fontWeight: 'bold',
      marginBottom: 60,
      textAlign: 'center',
      color: theme.colors.text,
      textTransform: 'capitalize'
    },
    forgotContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 30,
      marginTop: 5
    },
    rememberText: {
      color: '#303e67',
      fontSize: 14
    },
    forgotText: {
      color: theme.colors.text,
      fontSize: 14
    },
    biometricContainer: {
      alignItems: 'center',
      marginTop: 15,
      marginBottom: 15
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginBottom: 20
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border
    },
    orText: {
      color: theme.colors.text,
      marginHorizontal: 10,
      fontSize: 14
    },
    signupContainer: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 10
    },
    noAccountText: {
      color: '#303e67',
      fontSize: 14,
      marginBottom: 5
    },
    signupText: {
      color: '#303e67',
      fontSize: 14,
      fontWeight: 'bold'
    },
    securityAlert: {
      backgroundColor: '#FF3B30',
      marginBottom: 20,
      marginHorizontal: 20,
      borderRadius: 4
    },
    pwaInstallContainer: {
      marginTop: 20,
      marginBottom: 10,
      alignItems: 'center'
    },
    pwaInstallMessage: {
      textAlign: 'center',
      marginBottom: 20,
      color: theme.colors.text,
      fontSize: 16,
      lineHeight: 24
    }
  })

const useAuthenticationStyle = () => {
  const { theme, themeType } = useAppTheme()
  return createAuthenticationStyle(theme, themeType)
}

export default useAuthenticationStyle
