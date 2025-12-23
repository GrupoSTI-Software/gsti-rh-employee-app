import { Dimensions, StyleSheet } from 'react-native'
import { IAppTheme } from '../../theme/app-theme.interface'
import { useAppTheme } from '../../theme/theme-context'
import { EThemeType } from '../../theme/types/theme-type.enum'

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

// Helper functions for responsive design
const wp = (percentage: number) => (screenWidth * percentage) / 100
const hp = (percentage: number) => (screenHeight * percentage) / 100
const sp = (size: number) => (screenWidth / 375) * size // Scale based on iPhone X width as reference

const createAttendanceCheckStyle = (theme: IAppTheme, themeType: EThemeType) =>
  StyleSheet.create({
    backgroundWrapper: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: hp(2)
    },
    backgroundImage: {
      flex: 1,
      width: '100%',
      height: '100%'
    },
    container: {
      flex: 1,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'flex-start'
    },
    checkInContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      zIndex: 10,
      position: 'relative'
    },
    checkInButtonWrapper: {
      borderRadius: wp(100),
      padding: wp(2),
      marginTop: hp(4),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp(-9.5),
      zIndex: 10,
      position: 'relative',
      backgroundColor: theme.colors.background
    },
    checkInButton: {
      borderRadius: wp(100),
      width: wp(35),
      height: wp(35),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#34d4ad'
    },
    checkInText: {
      fontWeight: 'bold',
      fontSize: sp(10),
      marginTop: hp(1.5),
      color: theme.colors.buttonText
    },
    timeContainer: {
      marginTop: hp(4),
      alignItems: 'center'
    },
    hour: {
      fontSize: sp(20),
      fontWeight: 'bold',
      color: theme.colors.text
    },
    date: {
      fontSize: sp(12),
      marginTop: hp(0.5),
      textTransform: 'capitalize',
      color: theme.colors.text
    },
    indicatorsContainer: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      marginTop: hp(1),
      gap: hp(1.2),
      width: '100%'
    },
    indicator: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: hp(1.4),
      paddingHorizontal: wp(4.3),
      borderRadius: wp(3),
      backgroundColor: theme.colors.indicator
    },
    indicatorLabel: {
      fontSize: sp(12),
      flex: 1,
      marginLeft: wp(4.3),
      color: theme.colors.textSecondary
    },
    indicatorValue: {
      fontWeight: 'bold',
      fontSize: sp(15),
      flex: 1,
      textAlign: 'right',
      marginLeft: wp(6.4),
      color: theme.colors.textSecondary
    },
    indicatorActive: {
      backgroundColor: theme.colors.indicatorActive
    },
    indicatorLabelActive: {
      color: theme.colors.accent
    },
    indicatorValueActive: {
      color: theme.colors.accent
    },
    bottomCard: {
      borderRadius: wp(5),
      marginTop: hp(3.8),
      width: '100%',
      alignSelf: 'center',
      paddingVertical: hp(3.8),
      paddingHorizontal: wp(4.3),
      backgroundColor: theme.colors.indicator,
      zIndex: 1,
      position: 'relative'
    },
    checkInButtonWrapperLocked: {
      opacity: 1,
      backgroundColor: theme.colors.background
    },
    checkInButtonLocked: {
      backgroundColor: theme.colors.background
    },
    checkInTextLocked: {
      color: theme.colors.textSecondary
    },
    biometricContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: hp(2.4)
    },
    cancelButton: {
      backgroundColor: '#f1f5f9',
      borderRadius: wp(5),
      paddingVertical: hp(1.4),
      paddingHorizontal: wp(6.4),
      marginTop: hp(1.9)
    },
    cancelButtonText: {
      color: '#88a4bf',
      fontWeight: 'bold',
      fontSize: sp(15)
    },
    checkIconIndicator: {
      color: theme.colors.textSecondary
    },
    checkButtonIcon: {
      color: theme.colors.buttonText
    },
    checkButtonIconLocked: {
      color: theme.colors.textSecondary
    },
    locationContainer: {
      marginTop: hp(2.9),
      paddingTop: hp(2.4),
      borderTopWidth: 1,
      borderTopColor: theme.colors.indicatorActive,
      width: '100%'
    },
    locationTitle: {
      fontSize: sp(15),
      fontWeight: 'bold',
      marginBottom: hp(1),
      color: theme.colors.text,
      textAlign: 'center'
    },
    locationCoordinates: {
      fontSize: sp(15),
      fontFamily: 'monospace',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: hp(0.5)
    },
    locationAccuracy: {
      fontSize: sp(15),
      color: theme.colors.textSecondary,
      textAlign: 'center'
    },
    locationPlaceholder: {
      fontSize: sp(15),
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic'
    },
    scrollContainer: {
      flex: 1,
      width: '100%'
    },
    scrollContent: {
      flexGrow: 1,
      alignItems: 'center',
      paddingHorizontal: 0,
      paddingBottom: hp(2)
    },
    dateShift: {
      color: theme.colors.text,
      textAlign: 'center',
      width: '100%',
      marginTop: hp(0.5)
    },
    datePrevious: {
      marginTop: hp(7.42)
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    cameraContainer: { flex: 1, backgroundColor: '#000' },
    camera: { flex: 1 },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 80
    },
    oval: {
      width: 280,
      height: 550,          
      borderWidth: 3,
      borderColor: '#fff',
      borderStyle: 'dashed',
      borderRadius: 200,
      backgroundColor: 'transparent',
      alignSelf: 'center',
      marginTop: 10
    },
    captureButton: {
      width: 110,
      height: 110,
      borderRadius: 90,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: -10,
      borderColor: '#000',
      borderWidth: 1
    },
    innerDot: {
      position: 'absolute',
      width: 20,
      height: 20,
      borderRadius: 15,
      backgroundColor: 'black'
    },
    backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 50,
      borderColor: '#000',
      borderWidth: 1
    },
    textStatus: {
      position: 'absolute',
      backgroundColor: '#00000095',
      top: 643,
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
      padding: 7,
      textAlign: 'center'
    },
    permissionContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    innerCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: 'black'
    },
    button: {
      backgroundColor: '#007AFF',
      padding: 10,
      marginTop: 20,
      borderRadius: 8
    },
    containerCalendar: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: 0,
      paddingVertical: 15   
    },
    hoursButton: {
      alignSelf: 'flex-start',
      width: 70,
      height: 70,
      borderRadius: 16,
      backgroundColor: themeType === EThemeType.LIGHT ? '#FFFFFF' : theme.colors.background,
      borderWidth: 1,
      borderColor: 'rgba(150, 180, 220, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowOpacity: 0.15,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
      marginRight: 4
    },
    calendarButton: {
      alignSelf: 'flex-end',
      width: 70,
      height: 70,
      borderRadius: 16,
      backgroundColor: themeType === EThemeType.LIGHT ? '#FFFFFF' : theme.colors.background,
      borderWidth: 1,
      borderColor: 'rgba(150, 180, 220, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowOpacity: 0.15,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4
    },
    calendarDateText: {
      fontSize: 18,
      color: themeType === EThemeType.LIGHT ? '#000000ff' : '#FFFFFF',
      fontWeight: '600'
    },
    calendar: { 
      alignItems: 'center', 
      justifyContent: 'center' 
    },
    buttonText: { color: '#fff' },
    iconButton: {
      padding: 10
    },
    containerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 0,
      width: '100%',
      marginTop: -30,
      zIndex: 10,
      position: 'relative'
    },
    arrowButton: {
      width: 60,
      height: 60,
      borderRadius: 12,
      backgroundColor: themeType === EThemeType.LIGHT ? '#FFFFFF' : theme.colors.background,
      borderWidth: 1,
      borderColor: 'rgba(150, 180, 220, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
      marginTop: 70
    },
    centerWrapper: {
      flex: 1,
      alignItems: 'center',
      zIndex: 10,
      position: 'relative'
    }

  })

const useAttendanceCheckStyle = () => {
  const { theme, themeType } = useAppTheme()
  return createAttendanceCheckStyle(theme, themeType)
}

export default useAttendanceCheckStyle
