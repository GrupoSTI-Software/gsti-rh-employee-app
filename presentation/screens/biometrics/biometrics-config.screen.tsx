import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  SafeAreaView,
  ScrollView,
  View
} from 'react-native'
import { Button } from '../../components/button/button.component'
import { Typography } from '../../components/typography/typography.component'
import { CheckIcon } from '../../icons/check-icon/check.icon'
import { CogIcon } from '../../icons/cog-icon/cog.icon'
import { FingerprintIcon } from '../../icons/fingerprint-icon/fingerprint.icon'
import { WarningIcon } from '../../icons/warning-icon/warning.icon'
import AuthenticatedLayout from '../../layouts/authenticated-layout/authenticated.layout'
import { useAppTheme } from '../../theme/theme-context'
import { BiometricsConfigScreenController } from './biometrics-config-screen.controller'
import { useBiometricsConfigScreenStyle } from './biometrics-config-screen.style'

/**
 * Pantalla de configuración de biometría
 * Esta pantalla se muestra después del primer inicio de sesión para permitir al usuario habilitar la biometría
 * @returns {React.ReactElement} Componente de pantalla de configuración de biometría
 */
const BiometricsConfigScreen = (): React.ReactElement => {
  const { t } = useTranslation()
  const styles = useBiometricsConfigScreenStyle()
  const controller = BiometricsConfigScreenController()
  const { themeType } = useAppTheme()

  return (
    <AuthenticatedLayout>
      <StatusBar style={themeType === 'light' ? 'dark' : 'light'} />
      <SafeAreaView style={styles.safeAreaContent}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.container}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Typography variant="h1" style={styles.title}>{t('screens.biometrics.title')}</Typography>
                <Typography variant="h2" style={styles.subtitle} fontWeight='normal'>{t('screens.biometrics.subtitle')}</Typography>
              </View>

              <View style={styles.biometricOptions}>

                {controller.deviceBiometricSupport ? (
                  <View>
                    {controller.biometricsEnabled ? (
                      // La biometría está habilitada en el estado de autenticación
                      <View style={styles.biometricOption}>
                        <View style={styles.iconContainer}>
                          <CheckIcon size={styles.likeIcon.height} color={styles.likeIcon.color} />
                        </View>
                        <Typography variant="body" style={styles.optionDescription}>
                          {t('screens.biometrics.biometricsEnabled')}
                        </Typography>
                      </View>
                    ) : (
                      // El dispositivo si soporta algún tipo de biométrico
                      <View>
                        {!controller.biometricAvailable && (controller.deviceSupportsFace || controller.deviceSupportsFingerprint) && (
                        // El dispositivo soporta biométrico pero no está configurado en las configuraciones del dispositivo
                          <View style={styles.biometricOption}>
                            <View style={styles.iconContainer}>
                              <CogIcon size={styles.cogIcon.height} color={styles.iconButton.color} />
                            </View>
                            <Typography variant="h3" style={styles.optionTitle}>{t('screens.biometrics.notConfigured')}</Typography>
                            <Typography variant="body2" style={styles.optionDescription}>
                              {t('screens.biometrics.deviceSupportsButNotConfigured')}
                            </Typography>
                          </View>
                        )}

                        {controller.biometricAvailable && (
                        // El dispositivo tiene biométrico disponible
                          <View style={styles.biometricOption}>
                            <View style={styles.iconContainer}>
                              <FingerprintIcon size={styles.fingerprintIcon.height} color={styles.iconButton.color} />
                            </View>
                            <Typography variant="h3" style={styles.optionTitle}>
                              {controller.biometricTextInfo.title}
                            </Typography>
                            <Typography variant="body2" style={styles.optionDescription}>
                              {controller.biometricTextInfo.description}
                            </Typography>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ) : (
                  // Si el dispositivo no soporta ningún biométrico
                  <View style={styles.biometricOption}>
                    <View style={styles.iconContainer}>
                      <WarningIcon size={styles.warningIcon.height} color={styles.warningIcon.color} />
                    </View>
                    <Typography variant="h3" style={styles.optionTitle}>{t('screens.biometrics.notSupported')}</Typography>
                    <Typography variant="body2" style={styles.optionDescription}>
                      {t('screens.biometrics.deviceNotSupported')}
                    </Typography>
                  </View>
                )}
              </View>

              <View style={styles.actionsContainer}>
                {controller.biometricAvailable && controller.deviceBiometricSupport && !controller.biometricsEnabled ? (
                  // El dispositivo tiene biométrico disponible y soporta algún tipo de biométrico
                  <Button
                    title={`${t('screens.biometrics.enableButton')} ${controller.biometricTextInfo.title}`}
                    onPress={controller.enableBiometrics}
                    loading={controller.loading}
                  />
                ) : (
                  <View></View>
                )}

                {!controller.biometricsEnabled && (
                  <View style={styles.secondaryButtonWrapper}>
                    <Button
                      title={t('screens.biometrics.skipButton')}
                      onPress={controller.skipBiometricsSetup}
                      loading={controller.loading}
                      mode="outlined"
                    />
                  </View>
                )}

                {controller.biometricsEnabled && (
                  // La biometría está habilitada en el estado de autenticación
                  <View style={styles.secondaryButtonWrapper}>
                    <Button
                      title={t('screens.biometrics.unsetBiometricsButton')}
                      onPress={controller.unsetBiometrics}
                      loading={controller.loading}
                      mode="outlined"
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AuthenticatedLayout>
  )
}

export { BiometricsConfigScreen }
