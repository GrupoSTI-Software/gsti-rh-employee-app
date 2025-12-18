import { StyleSheet } from 'react-native'
import { IAppTheme } from '../../theme/app-theme.interface'
import { useAppTheme } from '../../theme/theme-context'

const createAttendanceExceptionsListStyles = (theme: IAppTheme)  =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flex: 1,
      padding: 20,
      paddingTop: 50,
      backgroundColor: theme.colors.background,
      zIndex: 1000
    },
    dateText: {
      fontSize: 18,
      color: '#5F7FA6',
      fontWeight: '600',
      textAlign: 'left',
      marginBottom: 16
    },
    closeBtn: {
      position: 'absolute',
      top: 20,
      right: 20,
      padding: 6,
      zIndex: 10
    },
    closeText: {
      fontSize: 24,
      color: '#88a4bf',
      fontWeight: 'bold'
    },
    list: {
      flex: 1
    },
    exceptionCard: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: '#5F7FA6',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5
    },
    exceptionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12
    },
    exceptionType: {
      marginLeft: 8,
      fontSize: 18,
      color: '#5F7FA6',
      fontWeight: '600'
    },
    descriptionContainer: {
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0'
    },
    descriptionLabel: {
      fontSize: 14,
      color: '#88a4bf',
      fontWeight: '500',
      marginBottom: 4
    },
    descriptionText: {
      fontSize: 15,
      color: '#5F7FA6',
      lineHeight: 20
    },
    timeContainer: {
      marginBottom: 12
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8
    },
    timeInfo: {
      marginLeft: 8,
      flex: 1
    },
    timeLabel: {
      fontSize: 13,
      color: '#88a4bf',
      fontWeight: '500'
    },
    timeValue: {
      fontSize: 16,
      color: '#5F7FA6',
      fontWeight: '600',
      marginTop: 2
    },
    evidencesContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0'
    },
    evidencesTitle: {
      fontSize: 14,
      color: '#88a4bf',
      fontWeight: '600',
      marginBottom: 8
    },
    evidencesScroll: {
      flexDirection: 'row'
    },
    evidenceItem: {
      marginRight: 12,
      borderRadius: 8,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.2,
      shadowRadius: 3.84,
      elevation: 5
    },
    evidenceThumbnail: {
      width: 120,
      height: 120,
      borderRadius: 8
    },
    fileThumbnailContainer: {
      width: 120,
      height: 120,
      borderRadius: 8,
      backgroundColor: '#F0F0F0',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 8,
      borderWidth: 1,
      borderColor: '#E0E0E0'
    },
    fileNameText: {
      fontSize: 10,
      color: '#5F7FA6',
      textAlign: 'center',
      marginTop: 4,
      fontWeight: '500'
    },
    fileTypeBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: '#5F7FA6',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4
    },
    fileTypeText: {
      fontSize: 8,
      color: '#FFFFFF',
      fontWeight: 'bold'
    },
    emptyContainer: {
      marginTop: 40,
      alignItems: 'center'
    },
    emptyText: {
      fontSize: 16,
      color: '#A0A0A0',
      fontStyle: 'italic'
    },
    imageModalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    imageModalBackdrop: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center'
    },
    imageModalContent: {
      width: '90%',
      height: '90%',
      position: 'relative'
    },
    imageModalCloseBtn: {
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center'
    },
    imageModalCloseText: {
      fontSize: 24,
      color: '#FFFFFF',
      fontWeight: 'bold'
    },
    imageModalImage: {
      width: '100%',
      height: '100%'
    }
  })


const createAttendanceExceptionListStyles = () => {
  const { theme } = useAppTheme()
  return createAttendanceExceptionsListStyles(theme)
}

export default createAttendanceExceptionListStyles
