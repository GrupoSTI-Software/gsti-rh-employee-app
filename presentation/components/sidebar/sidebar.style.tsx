import { Dimensions, StyleSheet } from 'react-native'
import { IAppTheme } from '../../theme/app-theme.interface'
import { useAppTheme } from '../../theme/theme-context'
import { EThemeType } from '../../theme/types/theme-type.enum'
const { width } = Dimensions.get('window')

const createSidebarStyles = (theme: IAppTheme, themeType: EThemeType) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: 1
    },
    sidebar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: width,
      zIndex: 2,
      elevation: 8,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      overflow: 'hidden',
      backgroundColor: themeType === EThemeType.LIGHT ? '#FFFFFF' : theme.colors.background,
      shadowColor: theme.dark ? '#000' : '#000'
    },
    closeButton: {
      position: 'absolute',
      right: 16,
      zIndex: 1,
      padding: 10
    },
    scrollContent: {
      paddingBottom: 32
    },
    profileSection: {
      alignItems: 'center',
      paddingTop: 36,
      paddingBottom: 24,
      backgroundColor: themeType === EThemeType.LIGHT ? '#FFFFFF' : theme.colors.background
    },
    avatarWrapper: {
      position: 'relative',
      marginBottom: 12
    },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 2,
      borderColor: theme.colors.border
    },
    avatarTextWrapper: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 2,
      borderColor: 'rgb(210, 237, 248)',
      position: 'relative',
      marginBottom: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgb(210, 237, 248)'
    },
    avatarText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text
    },
    profileName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text
    },
    profileEmail: {
      fontSize: 14,
      marginBottom: 10,
      color: theme.colors.text
    },
    menuGroup: {
      marginBottom: 0,
      backgroundColor: themeType === EThemeType.LIGHT ? '#FFFFFF' : theme.colors.background
    },
    separator: {
      height: 1,
      marginVertical: 10,
      marginHorizontal: 18,
      backgroundColor: theme.colors.border
    },
    sidebarIcon: {
      color: theme.colors.iconColor
    },
    logoutIcon: {
      color: theme.colors.danger
    },
    sidebarIconText: {
      color: theme.colors.text
    },
    themeBackgroundColor: {
      color: themeType === EThemeType.LIGHT ? '#FFFFFF' : theme.colors.background
    },
    safeAreaView: {
      flex: 1,
      backgroundColor: themeType === EThemeType.LIGHT ? '#FFFFFF' : theme.colors.background
    },
    versionContainer: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginTop: 'auto'
    },
    versionText: {
      textAlign: 'center',
      color: theme.colors.textSecondary || 'rgba(128, 128, 128, 0.7)',
      fontSize: 12
    }
  })

const useSidebarStyles = () => {
  const { theme, themeType } = useAppTheme()
  return createSidebarStyles(theme, themeType)
}

export default useSidebarStyles
