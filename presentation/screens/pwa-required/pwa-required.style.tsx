import { Dimensions, StyleSheet } from 'react-native'
import { IAppTheme } from '../../theme/app-theme.interface'
import { useAppTheme } from '../../theme/theme-context'
import { EThemeType } from '../../theme/types/theme-type.enum'

const { width } = Dimensions.get('window')

const createPWARequiredStyle = (theme: IAppTheme, themeType: EThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeType === EThemeType.LIGHT ? '#F8FAFC' : '#0F172A'
    },
    gradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24
    },
    content: {
      width: '100%',
      maxWidth: 400,
      alignItems: 'center',
      paddingHorizontal: 20
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 30,
      backgroundColor: themeType === EThemeType.LIGHT ? '#EEF2FF' : '#1E293B',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 32,
      shadowColor: themeType === EThemeType.LIGHT ? '#6366F1' : '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 8
    },
    iconEmoji: {
      fontSize: 56
    },
    title: {
      fontSize: width > 400 ? 28 : 24,
      fontWeight: '700',
      color: themeType === EThemeType.LIGHT ? '#1E293B' : '#F8FAFC',
      textAlign: 'center',
      marginBottom: 12,
      letterSpacing: -0.5
    },
    subtitle: {
      fontSize: 16,
      color: themeType === EThemeType.LIGHT ? '#64748B' : '#94A3B8',
      textAlign: 'center',
      marginBottom: 40,
      lineHeight: 24,
      paddingHorizontal: 10
    },
    stepsContainer: {
      width: '100%',
      backgroundColor: themeType === EThemeType.LIGHT ? '#FFFFFF' : '#1E293B',
      borderRadius: 20,
      padding: 24,
      marginBottom: 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: themeType === EThemeType.LIGHT ? 0.08 : 0.3,
      shadowRadius: 16,
      elevation: 4
    },
    stepsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: themeType === EThemeType.LIGHT ? '#6366F1' : '#818CF8',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 20,
      textAlign: 'center'
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16
    },
    stepNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: themeType === EThemeType.LIGHT ? '#EEF2FF' : '#312E81',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14
    },
    stepNumberText: {
      fontSize: 14,
      fontWeight: '700',
      color: themeType === EThemeType.LIGHT ? '#6366F1' : '#A5B4FC'
    },
    stepTextContainer: {
      flex: 1,
      paddingTop: 4
    },
    stepText: {
      fontSize: 15,
      color: themeType === EThemeType.LIGHT ? '#334155' : '#E2E8F0',
      lineHeight: 22
    },
    stepHighlight: {
      fontWeight: '600',
      color: themeType === EThemeType.LIGHT ? '#1E293B' : '#F8FAFC'
    },
    installButton: {
      width: '100%',
      backgroundColor: '#6366F1',
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6
    },
    installButtonDisabled: {
      backgroundColor: themeType === EThemeType.LIGHT ? '#E2E8F0' : '#334155'
    },
    installButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '600',
      letterSpacing: 0.3
    },
    installButtonTextDisabled: {
      color: themeType === EThemeType.LIGHT ? '#94A3B8' : '#64748B'
    },
    browserHint: {
      marginTop: 24,
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: themeType === EThemeType.LIGHT ? '#FEF3C7' : '#422006',
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center'
    },
    browserHintIcon: {
      fontSize: 18,
      marginRight: 10
    },
    browserHintText: {
      flex: 1,
      fontSize: 13,
      color: themeType === EThemeType.LIGHT ? '#92400E' : '#FCD34D',
      lineHeight: 18
    },
    logoContainer: {
      position: 'absolute',
      top: 60,
      alignItems: 'center',
      width: '100%'
    },
    logo: {
      width: 100,
      height: 40,
      resizeMode: 'contain'
    },
    appName: {
      fontSize: 18,
      fontWeight: '600',
      color: themeType === EThemeType.LIGHT ? '#1E293B' : '#F8FAFC',
      marginTop: 8
    }
  })

const usePWARequiredStyle = () => {
  const { theme, themeType } = useAppTheme()
  return createPWARequiredStyle(theme, themeType)
}

export default usePWARequiredStyle

