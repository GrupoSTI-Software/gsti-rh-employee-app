import { StyleSheet } from 'react-native'
import { useAppTheme } from '../../theme/theme-context'

/**
 * Hook personalizado para los estilos de la pantalla de perfil
 * @returns {StyleSheet.NamedStyles<any>} Estilos de la pantalla de perfil
 */
const useProfileStyle = () => {
  const { theme } = useAppTheme()

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    safeAreaContent: {
      flex: 1
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingBottom: 20
    },
    header: {
      alignItems: 'flex-start',
      marginBottom: 30,
      paddingTop: 20
    },
    title: {
      color: theme.colors.text,
      marginBottom: 8
    },
    subtitle: {
      color: theme.colors.textSecondary
    },
    profileCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: theme.colors.text,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16
    },
    avatarText: {
      color: theme.colors.buttonText,
      fontSize: 32,
      fontWeight: 'bold'
    },
    profileInfo: {
      flex: 1
    },
    profileName: {
      color: theme.colors.text,
      marginBottom: 4
    },
    profileRole: {
      color: theme.colors.textSecondary
    },
    sectionTitle: {
      color: theme.colors.text,
      marginBottom: 16,
      marginTop: 8
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    infoRowLast: {
      borderBottomWidth: 0
    },
    infoLabel: {
      color: theme.colors.textSecondary,
      flex: 1
    },
    infoValue: {
      color: theme.colors.text,
      flex: 2,
      textAlign: 'right'
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20
    },
    errorText: {
      color: theme.colors.danger,
      textAlign: 'center',
      marginBottom: 16
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8
    },
    retryButtonText: {
      color: theme.colors.buttonText
    },
    backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      zIndex: 10,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 8,
      shadowColor: theme.colors.text,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    }
  })
}

export default useProfileStyle 
