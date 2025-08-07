import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native'
import Animated, {
  FadeInDown,
  ZoomIn
} from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { Typography } from '../../components/typography/typography.component'
import { FingerprintIcon } from '../../icons/fingerprint-icon/fingerprint.icon'
import { ThemeIcon } from '../../icons/theme-icon/theme.icon'
import { TranslateIcon } from '../../icons/translate-icon/translate.icon'
import AuthenticatedLayout from '../../layouts/authenticated-layout/authenticated.layout'
import { SettingsScreenController } from './settings-screen.controller'
import useSettingsStyle from './settings.style'

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

/**
 * @description SettingsScreen es la pantalla que permite al usuario gestionar la configuración de la aplicación
 * @returns {React.FC}
 */
export const SettingsScreen: React.FC = () => {
  const controller = SettingsScreenController()
  const style = useSettingsStyle()
  const { t } = useTranslation()

  return (
    <AuthenticatedLayout>
      <View style={style.container}>
        <StatusBar style={controller.themeType === 'light' ? 'dark' : 'light'} />
        
        <SafeAreaView style={style.safeAreaContent}>
          <ScrollView
            contentContainerStyle={style.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Header con animación */}
            <Animated.View 
              entering={FadeInDown.delay(100).duration(400)}
              style={style.header}
            >
              <Typography variant="h1" textAlign="center" style={style.title}>
                {t('screens.settings.title')}
              </Typography>
              <Typography variant="h2" textAlign="center" fontWeight="normal" style={style.subtitle}>
                {t('screens.settings.subtitle')}
              </Typography>
            </Animated.View>

            <View style={style.optionsContainer}>
              {/* Opción de Configuración de Biometría */}
              <AnimatedTouchableOpacity
                entering={ZoomIn.delay(200).duration(400)}
                style={style.optionCard}
                onPress={controller.navigateToBiometrics}
                activeOpacity={0.7}
              >
                <View style={style.optionLeft}>
                  <View style={[style.iconContainer]}>
                    <FingerprintIcon color={style.iconColor.color} />
                  </View>
                  <View style={style.optionContent}>
                    <Typography variant="h3">
                      {t('screens.settings.biometricsOption.title')}
                    </Typography>
                    <Typography variant="body2">
                      {t('screens.settings.biometricsOption.description')}
                    </Typography>
                  </View>
                </View>
                <Icon 
                  name="chevron-right" 
                  size={24} 
                  color={style.chevronColor.color} 
                />
              </AnimatedTouchableOpacity>

              {/* Opción de Tema */}
              <AnimatedTouchableOpacity
                entering={ZoomIn.delay(350).duration(400)}
                style={style.optionCard}
                onPress={controller.toggleTheme}
                activeOpacity={0.7}
              >
                <View style={style.optionLeft}>
                  <View style={[style.iconContainer]}>
                    <ThemeIcon
                      color={style.iconColor.color}
                      isDark={controller.themeType === 'dark'}
                    />
                  </View>
                  <View style={style.optionContent}>
                    <Typography variant="h3">
                      {t('screens.settings.themeOption.title')}
                    </Typography>
                    <Typography variant="body2">
                      {t('screens.settings.themeOption.description')}
                    </Typography>
                    <Typography variant="caption" color={style.currentValue.color}>
                      {controller.themeType === 'light' 
                        ? t('screens.settings.themeOption.lightTheme')
                        : t('screens.settings.themeOption.darkTheme')
                      }
                    </Typography>
                  </View>
                </View>
              </AnimatedTouchableOpacity>

              {/* Opción de Idioma */}
              <AnimatedTouchableOpacity
                entering={ZoomIn.delay(500).duration(400)}
                style={style.optionCard}
                onPress={controller.showLanguageModal}
                activeOpacity={0.7}
              >
                <View style={style.optionLeft}>
                  <View style={[style.iconContainer]}>
                    <TranslateIcon color={style.iconColor.color} />
                  </View>
                  <View style={style.optionContent}>
                    <Typography variant="h3">
                      {t('screens.settings.languageOption.title')}
                    </Typography>
                    <Typography variant="body2">
                      {t('screens.settings.languageOption.description')}
                    </Typography>
                    <Typography variant="caption" color={style.currentValue.color}>
                      {controller.getCurrentLanguageName()}
                    </Typography>
                  </View>
                </View>
                <Icon 
                  name="chevron-right" 
                  size={24} 
                  color={style.chevronColor.color} 
                />
              </AnimatedTouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* Modal de Selección de Idioma */}
        <Modal
          visible={controller.isLanguageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={controller.hideLanguageModal}
        >
          <TouchableOpacity 
            style={style.modalOverlay}
            activeOpacity={1}
            onPress={controller.hideLanguageModal}
          >
            <TouchableOpacity 
              style={style.languageModalContainer}
              activeOpacity={1}
              onPress={() => {}} // Prevenir cierre al tocar el modal
            >
              <View style={style.modalHeader}>
                <Typography variant="h3" textAlign="center">
                  {t('screens.settings.languageOption.modal.title')}
                </Typography>
                <Typography variant="body2" textAlign="center">
                  {t('screens.settings.languageOption.modal.subtitle')}
                </Typography>
              </View>

              <View style={style.languagesList}>
                {controller.availableLanguages.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      style.languageOption,
                      controller.currentLanguage === language.code && style.languageOptionSelected
                    ]}
                    onPress={() => controller.changeLanguage(language.code)}
                    activeOpacity={0.7}
                  >
                    <View style={style.languageOptionContent}>
                      <View style={style.languageFlag}>
                        <Icon 
                          name="web" 
                          size={14} 
                          color={style.iconColor.color} 
                        />
                      </View>
                      <Typography 
                        variant="h3"
                        color={controller.currentLanguage === language.code ? style.languageTextSelected.color : style.languageText.color}
                      >
                        {language.nativeName}
                      </Typography>
                    </View>
                    {controller.currentLanguage === language.code && (
                      <Icon 
                        name="check-circle" 
                        size={20} 
                        color={style.iconColor.color} 
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={style.modalActions}>
                <TouchableOpacity
                  style={style.modalCancelButton}
                  onPress={controller.hideLanguageModal}
                  activeOpacity={0.7}
                >
                  <Typography variant="body2" color={style.modalCancelText.color}>
                    {t('common.cancel')}
                  </Typography>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </AuthenticatedLayout>
  )
}

export default SettingsScreen 
