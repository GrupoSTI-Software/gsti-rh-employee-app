import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
// import BottomSheet from '@gorhom/bottom-sheet'
import { CameraView } from 'expo-camera'
import { StatusBar } from 'expo-status-bar'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  ZoomIn
} from 'react-native-reanimated'
import { Clock } from '../../components/clock/clock.component'
import CustomAlert from '../../components/custom-alert/custom-alert'
import { Typography } from '../../components/typography/typography.component'
import { CheckInIcon } from '../../icons/check-in-icon/check-in.icon'
import { CheckOutIcon } from '../../icons/check-out-icon/check-out.icon'
import AuthenticatedLayout from '../../layouts/authenticated-layout/authenticated.layout'
import { AttendanceCheckScreenController } from './attendance-check-screen.controller'
import useAttendanceCheckStyle from './attendance-check.style'
// import { PasswordBottomSheet } from './password-bottom-sheet.component'
import Svg, { Circle, Path } from 'react-native-svg'
import { getIconColor } from './utils/get-icon-color'
import { getIndicatorStyles } from './utils/get-indicator-styles'
import { getLabelStyles } from './utils/get-label-styles'
import { getValueStyles } from './utils/get-value-styles'

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

/**
 * Pantalla para registro de asistencia
 * @returns {React.FC} 
 */
export const AttendanceCheckScreen: React.FC = React.memo(() => {
  const controller = AttendanceCheckScreenController()
  const styles = useAttendanceCheckStyle()
  const { t } = useTranslation()

  // Solo las optimizaciones que dependen de styles se quedan aquí
  const buttonWrapperStyles = useMemo(() => [
    styles.checkInButtonWrapper,
    controller.isButtonDisabled && styles.checkInButtonWrapperLocked
  ], [styles.checkInButtonWrapper, styles.checkInButtonWrapperLocked, controller.isButtonDisabled])

  const buttonStyles = useMemo(() => [
    styles.checkInButton,
    controller.isButtonDisabled && styles.checkInButtonLocked
  ], [styles.checkInButton, styles.checkInButtonLocked, controller.isButtonDisabled])

  const buttonTextStyles = useMemo(() => [
    styles.checkInText,
    controller.isButtonDisabled && styles.checkInTextLocked
  ], [styles.checkInText, styles.checkInTextLocked, controller.isButtonDisabled])

  const buttonIconColor = useMemo(() => 
    controller.isButtonDisabled ? styles.checkButtonIconLocked.color : styles.checkButtonIcon.color, [controller.isButtonDisabled, styles.checkButtonIconLocked.color, styles.checkButtonIcon.color]
  )
  if (controller.attendanceSuccess) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>

        <CustomAlert
          visible={controller.attendanceSuccess}
          title={`${t('common.success')}`}
          message={`✅ ${t('screens.attendanceCheck.attendanceRegisteredSuccessfully')}`}
          onClose={() => controller.setIsAttendanceSucess(false) }
        />
      </View>
    )
  }
  if (controller.permissionDeniedMessage) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>

        <CustomAlert
          visible={controller.permissionDeniedMessage}
          title={`${t('screens.attendanceCheck.permissions')}`}
          message={`🚫 ${t('screens.attendanceCheck.permissionDeniedPermanent')}`}
          onClose={() => controller.goBack() }
        />
      </View>
    )
  }
 
  if (controller.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.textStatus}>{controller.status}</Text>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    )
  } 
  if (controller.showFaceScreen) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={controller.cameraRef} style={styles.camera} facing="front" />
        
        <View style={styles.overlay}>
          <TouchableOpacity onPress={controller.goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={32} color="black" />
          </TouchableOpacity>
          
          <View style={styles.oval} />
          
          <Text style={styles.textStatus}>{controller.status}</Text>
          <TouchableOpacity onPress={controller.captureAndSend} style={styles.captureButton}>
            <Ionicons name="scan-outline" size={65} color="black" />
            <View style={styles.innerDot} />
          </TouchableOpacity>

        </View>
      </View>
    )
  } else {
    return (
      <GestureHandlerRootView>
        <AuthenticatedLayout>
          <View style={styles.backgroundWrapper}>
            <SafeAreaView style={styles.container}>
              <StatusBar style={controller.themeType === 'light' ? 'dark' : 'light'} />

              <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Título con animación */}
                <Animated.View
                  entering={FadeInDown.delay(100).duration(300)}
                >
                  <Typography variant="h2">
                    {t('screens.attendanceCheck.title')}
                  </Typography>
                </Animated.View>

                {/* Mensaje de error de conexión */}
                {controller.hasConnectionError ? (
                  <Animated.View
                    entering={FadeIn.delay(200).duration(400)}
                    style={{ 
                      flex: 1, 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      marginTop: 100 
                    }}
                  >
                    <Typography variant="h3" style={{ textAlign: 'center', color: '#666' }}>
                      {t('screens.attendanceCheck.connectionError.title')}
                    </Typography>
                    <Typography variant="body" style={{ textAlign: 'center', color: '#999', marginTop: 8 }}>
                      {t('screens.attendanceCheck.connectionError.message')}
                    </Typography>
                    
                    <TouchableOpacity 
                      onPress={controller.retryLoadData} 
                      disabled={controller.isRetrying}
                      style={{ 
                        marginTop: 20,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        backgroundColor: controller.isRetrying ? '#cccccc' : '#007bff',
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {controller.isRetrying && (
                        <ActivityIndicator 
                          size="small" 
                          color="#ffffff" 
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Typography variant="body" style={{ color: '#ffffff', fontWeight: '500' }}>
                        {controller.isRetrying ? t('screens.attendanceCheck.connectionError.retrying') : t('screens.attendanceCheck.connectionError.retryButton')}
                      </Typography>
                    </TouchableOpacity>
                  </Animated.View>
                ) : (
                  <>
                    {/* Contenido normal cuando hay conexión */}
                    <View style={styles.containerCalendar}>
                      <Text style={styles.calendarDateText}>
                        {controller.localDate.toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                        }
                      </Text>
                      {/* Botón central con calendario */}
                      <TouchableOpacity style={styles.calendarButton} onPress={() => controller.setShowPicker(true)}>
                        <Svg
                          width={20}
                          height={20}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <Path
                            d="M19,2H18V1a1,1,0,0,0-2,0V2H8V1A1,1,0,0,0,6,1V2H5A5.006,5.006,0,0,0,0,7V19a5.006,5.006,0,0,0,5,5H19a5.006,5.006,0,0,0,5-5V7A5.006,5.006,0,0,0,19,2ZM2,7A3,3,0,0,1,5,4H19a3,3,0,0,1,3,3V8H2ZM19,22H5a3,3,0,0,1-3-3V10H22v9A3,3,0,0,1,19,22Z"
                            fill="#88a4bf"
                          />
                          <Circle cx="12" cy="15" r="1.5" fill="#88a4bf" />
                          <Circle cx="7" cy="15" r="1.5" fill="#88a4bf" />
                          <Circle cx="17" cy="15" r="1.5" fill="#88a4bf" />
                        </Svg>
                      </TouchableOpacity>
                      
                    </View>
                    <View style={styles.containerButtons}>
                      {/* Izquierda */}
                      <TouchableOpacity style={styles.arrowButton} onPress={controller.handlePreviousDay}>
                        <MaterialIcons name="chevron-left" size={30} color="#7288A2" />
                      </TouchableOpacity>

                      {/* Centro (tu diseño intacto) */}
                      {controller.showButtonAssist ? (
                        <View style={styles.centerWrapper}>
                          <Animated.View 
                            entering={ZoomIn.delay(200).duration(400)}
                            style={[styles.checkInContainer, { zIndex: 10 }]}
                          >
                            <View style={[buttonWrapperStyles, { zIndex: 10 }]}>
                              <AnimatedTouchableOpacity
                                style={[buttonStyles, { zIndex: 10 }]}
                                onPress={controller.handleCheckIn}
                                disabled={controller.isButtonDisabled}
                                activeOpacity={0.8}
                              >
                                {controller.isLoadingLocation ? (
                                  <ActivityIndicator size={48} color={styles.checkButtonIcon.color} />
                                ) : (
                                  <CheckInIcon size={48} color={buttonIconColor} />
                                )}
                                <Typography variant="body" style={buttonTextStyles as any}>
                                  {controller.buttonText}
                                </Typography>
                              </AnimatedTouchableOpacity>
                            </View>
                          </Animated.View>
                        </View>
                      ) : (
                        <View />
                      )}
                      {/* Derecha */}
                      <TouchableOpacity style={styles.arrowButton} onPress={controller.handleNextDay}>
                        <MaterialIcons name="chevron-right" size={30} color="#7288A2" />
                      </TouchableOpacity>

                    </View>

                    {/* Tarjeta del reloj con animación */}
                
                    <Animated.View 
                      entering={ZoomIn.delay(250).duration(400)}
                      style={[
                        styles.bottomCard,
                        { zIndex: 1 }
                      ]}
                    >
                      {controller.showButtonAssist ? (
                        <Clock 
                          style={styles.timeContainer}
                          hourStyle={styles.hour}
                          dateStyle={styles.date}
                        />
                      ) : (
                        <Typography variant="body" style={[styles.dateShift, styles.date, styles.datePrevious]}>
                          {controller.dateSelectFormat}
                        </Typography>
                      )}

                      <Typography variant="body" style={styles.dateShift}>
                        {controller.shiftDate}
                      </Typography>
                    </Animated.View>
                  
                    {/* Indicadores con animaciones staggered */}
                    <Animated.View 
                      entering={FadeIn.delay(400).duration(300)}
                      style={[
                        styles.indicatorsContainer,
                        { zIndex: 1 }
                      ]}
                    >
                      {/* Entrada */}
                      <Animated.View 
                        entering={FadeInLeft.delay(500).duration(400)}
                        style={getIndicatorStyles(controller.attendanceData.checkInStatus, !!controller.attendanceData.checkInTime)}
                      >
                        <CheckOutIcon
                          size={24}
                          color={getIconColor(controller.attendanceData.checkInStatus)}
                        />
                        <Typography variant="body2" style={getLabelStyles(controller.attendanceData.checkInStatus, !!controller.attendanceData.checkInTime) as any}>
                          {t('screens.attendanceCheck.checkTypes.checkIn')}
                        </Typography>
                        <Typography variant="body2" style={getValueStyles(controller.attendanceData.checkInStatus, !!controller.attendanceData.checkInTime) as any}>
                          {controller.attendanceData.checkInTime || t('screens.attendanceCheck.defaultTime')}
                        </Typography>
                      </Animated.View>

                      {/* Iniciar Comida */}
                      <Animated.View 
                        entering={FadeInLeft.delay(650).duration(400)}
                        style={getIndicatorStyles(controller.attendanceData.checkEatInStatus, !!controller.attendanceData.checkEatInTime)}
                      >
                        <CheckOutIcon
                          size={24}
                          color={getIconColor(controller.attendanceData.checkEatInStatus)}
                        />
                        <Typography variant="body2" style={getLabelStyles(controller.attendanceData.checkEatInStatus, !!controller.attendanceData.checkEatInTime) as any}>
                          {t('screens.attendanceCheck.checkTypes.checkEatIn')}
                        </Typography>
                        <Typography variant="body2" style={getValueStyles(controller.attendanceData.checkEatInStatus, !!controller.attendanceData.checkEatInTime) as any}>
                          {controller.attendanceData.checkEatInTime || t('screens.attendanceCheck.defaultTime')}
                        </Typography>
                      </Animated.View>

                      {/* Terminar Comida */}
                      <Animated.View 
                        entering={FadeInLeft.delay(800).duration(400)}
                        style={getIndicatorStyles(controller.attendanceData.checkEatOutStatus, !!controller.attendanceData.checkEatOutTime)}
                      >
                        <CheckOutIcon
                          size={24}
                          color={getIconColor(controller.attendanceData.checkEatOutStatus)}
                        />
                        <Typography variant="body2" style={getLabelStyles(controller.attendanceData.checkEatOutStatus, !!controller.attendanceData.checkEatOutTime) as any}>
                          {t('screens.attendanceCheck.checkTypes.checkEatOut')}
                        </Typography>
                        <Typography variant="body2" style={getValueStyles(controller.attendanceData.checkEatOutStatus, !!controller.attendanceData.checkEatOutTime) as any}>
                          {controller.attendanceData.checkEatOutTime || t('screens.attendanceCheck.defaultTime')}
                        </Typography>
                      </Animated.View>

                      {/* Salida */}
                      <Animated.View 
                        entering={FadeInLeft.delay(950).duration(400)}
                        style={getIndicatorStyles(controller.attendanceData.checkOutStatus, !!controller.attendanceData.checkOutTime)}
                      >
                        <CheckOutIcon
                          size={24}
                          color={getIconColor(controller.attendanceData.checkOutStatus)}
                        />
                        <Typography variant="body2" style={getLabelStyles(controller.attendanceData.checkOutStatus, !!controller.attendanceData.checkOutTime) as any}>
                          {t('screens.attendanceCheck.checkTypes.checkOut')}
                        </Typography>
                        <Typography variant="body2" style={getValueStyles(controller.attendanceData.checkOutStatus, !!controller.attendanceData.checkOutTime) as any}>
                          {controller.attendanceData.checkOutTime || t('screens.attendanceCheck.defaultTime')}
                        </Typography>
                      </Animated.View>
                    </Animated.View>
                  </>
                )}
              </ScrollView>
            </SafeAreaView>
          </View>
          {/*<BottomSheet
            ref={controller.bottomSheetRef}
            index={-1}
            snapPoints={controller.snapPoints}
            enablePanDownToClose={false}
            onClose={controller.onClosePasswordDrawer}
            backdropComponent={controller.backdropComponent}
            animateOnMount={true}
            enableOverDrag={false}
          >
            <PasswordBottomSheet
              onPasswordSubmit={controller.onPasswordSubmit}
              onCancel={controller.onConfirmPasswordDrawer}
              error={controller.passwordError}
            />
          </BottomSheet> */}
          {controller.showPicker && (
            <DateTimePicker
              value={controller.localDate}
              mode="date"
              display={Platform.OS === 'android' ? 'calendar' : 'spinner'}// 👈 forzar calendario
              onChange={controller.handleDateChange}
            />
          )}
        </AuthenticatedLayout>
      </GestureHandlerRootView>
    )
  }

  
})
