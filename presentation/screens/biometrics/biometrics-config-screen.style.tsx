import { Dimensions, StyleSheet } from 'react-native'
import { IAppTheme } from '../../theme/app-theme.interface'
import { useAppTheme } from '../../theme/theme-context'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

// Funciones helper para calcular dimensiones responsivas
const hp = (percentage: number) => (screenHeight * percentage) / 100
const wp = (percentage: number) => (screenWidth * percentage) / 100

const createBiometricsConfigScreenStyle = (theme: IAppTheme) =>
  StyleSheet.create({
    safeAreaContent: {
      flex: 1
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingBottom: 20
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: hp(2)
    },
    content: {
      flex: 1,
      justifyContent: 'flex-start'
    },
    header: {
      marginBottom: hp(3.75)
    },
    title: {
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: hp(1.25),
      textAlign: 'center'
    },
    subtitle: {
      color: theme.colors.text,
      lineHeight: hp(2.75),
      textAlign: 'center'
    },
    biometricOptions: {
      flex: 1,
      justifyContent: 'center'
    },
    biometricOption: {
      alignItems: 'center',
      marginBottom: hp(3.75)
    },
    iconContainer: {
      width: wp(25),
      height: wp(25),
      borderRadius: wp(12.5),
      backgroundColor: theme.colors.indicatorActive,
      borderColor: theme.colors.indicatorActive,
      borderWidth: 4,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp(1.875)
    },
    iconButton: {
      color: theme.colors.iconColor
    },
    optionTitle: {
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: hp(0.625)
    },
    optionDescription: {
      color: theme.colors.text,
      textAlign: 'center',
      paddingHorizontal: wp(5)
    },
    actionsContainer: {
      marginTop: hp(5)
    },
    secondaryButtonWrapper: {
      marginTop: hp(1.25),
      marginBottom: hp(6.25)
    },
    fingerprintIcon: {
      height: hp(5.5)
    },
    likeIcon: {
      height: hp(5.5),
      color: theme.colors.success
    },
    cogIcon: {
      height: hp(5.5)
    },
    warningIcon: {
      height: hp(5.5),
      color: theme.colors.warning
    }
  })


const useBiometricsConfigScreenStyle = () => {
  const { theme } = useAppTheme()
  return createBiometricsConfigScreenStyle(theme)
}

export { useBiometricsConfigScreenStyle }
