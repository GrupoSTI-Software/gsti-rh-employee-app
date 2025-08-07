import React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native'
import { Divider, Snackbar } from 'react-native-paper'
import Animated, {
  BounceIn,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  ZoomIn
} from 'react-native-reanimated'

import { StatusBar } from 'expo-status-bar'
import { useTranslation } from 'react-i18next'

import { BiometricButton } from '../../components/biometric-button/biometric-button.component'
import { Button } from '../../components/button/button.component'
import { TextInput } from '../../components/text-input/text-input.component'
import { Typography } from '../../components/typography/typography.component'

import { environment } from '../../../config/environment'
import { useAppTheme } from '../../theme/theme-context'
import { AuthenticationScreenController } from './authentication-screen.controller'
import useAuthenticationStyle from './authentication.style'

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

const APP_VARIANT = environment.APP_VARIANT

/**
 * @description AuthenticationScreen es la pantalla que permite al usuario autenticarse con correo electrónico y contraseña
 * @returns {React.FC}
 */
export const AuthenticationScreen: React.FC = () => {
  const controller = AuthenticationScreenController()
  const style = useAuthenticationStyle()
  const { t } = useTranslation()
  const { themeType } = useAppTheme()
  
  let headBannerPath = APP_VARIANT === 'sae.production' ? require('../../../assets/sae/app-headbanner-2.png') : require('../../../assets/app-headbanner-2.png')

  switch (APP_VARIANT) {
  case 'sae-production':
    headBannerPath = require('../../../assets/sae/app-headbanner-2.png')
    break
  case 'gsti-demo-production':
    headBannerPath = require('../../../assets/gsti/app-headbanner-2.png')
    break
  default:
    headBannerPath = require('../../../assets/app-headbanner-2.png')
  }

  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      RNStatusBar.setBarStyle('light-content', true)
    }
  }, [])

  return (
    <View style={[style.container]}>
      <StatusBar style={themeType === 'light' ? 'dark' : 'light'} translucent={true} />

      <Animated.Image
        entering={FadeInUp.delay(100).duration(400)}
        source={headBannerPath}
        style={style.logoImage}
      />

      <SafeAreaView style={[style.safeAreaContent]}>
        <KeyboardAvoidingView
          style={style.flexContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 50}
        >
          <ScrollView
            contentContainerStyle={style.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View 
              entering={FadeInDown.delay(200).duration(300)}
              style={style.formContainer}
            >
              <Animated.View
                entering={FadeIn.delay(300).duration(250)}
              >
                <Typography variant="h1" style={[style.title]}>
                  {controller.getWelcomeTitle()}
                </Typography>
              </Animated.View>

              <Animated.View
                entering={SlideInLeft.delay(400).duration(250)}
              >
                <TextInput
                  label={t('screens.authentication.email')}
                  value={controller.email || ''}
                  onChangeText={(text) => controller.setEmail?.(text)}
                  keyboardType="email-address"
                  leftIcon="account"
                />
              </Animated.View>

              <Animated.View
                entering={SlideInRight.delay(500).duration(250)}
              >
                <TextInput
                  label={t('screens.authentication.password')}
                  value={controller.password || ''}
                  onChangeText={(text) => controller.setPassword?.(text)}
                  secureTextEntry
                  leftIcon="lock"
                  rightIcon="eye"
                />
              </Animated.View>

              <Animated.View 
                entering={FadeIn.delay(600).duration(200)}
                style={style.forgotContainer}
              >
                <AnimatedTouchableOpacity
                  entering={FadeIn.delay(650).duration(150)}
                >
                  <Typography variant="body2" style={[style.forgotText]}>
                    {t('screens.authentication.forgotPassword')}
                  </Typography>
                </AnimatedTouchableOpacity>
              </Animated.View>

              <Animated.View
                entering={ZoomIn.delay(700).duration(250)}
              >
                <Button
                  title={t('screens.authentication.loginButton')}
                  onPress={() => controller.loginHandler?.('email')}
                  loading={Boolean(controller.loginButtonLoading)}
                />
              </Animated.View>

              {controller.shouldShowBiometrics() && (
                <Animated.View 
                  entering={FadeInUp.delay(800).duration(300)}
                  style={style.biometricContainer}
                >
                  <Animated.View 
                    entering={FadeIn.delay(900).duration(200)}
                    style={style.dividerContainer}
                  >
                    <Divider style={[style.divider]} />
                    <Typography variant="body2" style={[style.orText]}>
                      {t('screens.authentication.or')}
                    </Typography>
                    <Divider style={[style.divider]} />
                  </Animated.View>
                  
                  <Animated.View
                    entering={BounceIn.delay(1000).duration(300)}
                  >
                    <BiometricButton
                      type={controller.biometricType || 'fingerprint'}
                      onPress={() => controller.loginHandler?.('biometric')}
                      disabled={Boolean(controller.loginButtonLoading)}
                    />
                  </Animated.View>
                </Animated.View>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Animated.View
          entering={FadeIn.delay(1100).duration(200)}
        >
          <Typography variant="caption" style={{ textAlign: 'center', color: 'rgb(176, 176, 176)', marginBottom: 40 }}>
            API: {controller.settedAPIUrl}
          </Typography>
        </Animated.View>

        <Snackbar
          visible={!!controller.securityAlert}
          onDismiss={() => controller.setSecurityAlert(null)}
          duration={3000}
          style={style.securityAlert}
        >
          {controller.securityAlert}
        </Snackbar>
      </SafeAreaView>
    </View>
  )
}

export default AuthenticationScreen
