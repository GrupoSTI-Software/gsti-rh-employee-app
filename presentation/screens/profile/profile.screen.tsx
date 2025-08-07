import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native'
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { Typography } from '../../components/typography/typography.component'
import AuthenticatedLayout from '../../layouts/authenticated-layout/authenticated.layout'
import { ProfileScreenController } from './profile-screen.controller'
import useProfileStyle from './profile.style'

const AnimatedView = Animated.createAnimatedComponent(View)

/**
 * @description ProfileScreen es la pantalla que muestra la información del perfil del usuario
 * @returns {React.FC}
 */
export const ProfileScreen: React.FC = () => {
  const controller = ProfileScreenController()
  const style = useProfileStyle()
  const { t } = useTranslation()

  if (controller.loading) {
    return (
      <AuthenticatedLayout>
        <View style={style.container}>
          <StatusBar
            style={controller.themeType === 'light' ? 'dark' : 'light'}
          />
          <View style={style.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={style.avatarContainer.backgroundColor}
            />
            <Typography
              variant="body"
              style={{ marginTop: 16, color: style.title.color }}
            >
              {t('screens.profile.loading')}
            </Typography>
          </View>
        </View>
      </AuthenticatedLayout>
    )
  }

  if (controller.error || !controller.authState?.user) {
    return (
      <AuthenticatedLayout>
        <View style={style.container}>
          <StatusBar
            style={controller.themeType === 'light' ? 'dark' : 'light'}
          />
          <View style={style.errorContainer}>
            <Icon name="alert-circle" size={48} color={style.errorText.color} />
            <Typography variant="h3" style={style.errorText}>
              {controller.error || t('screens.profile.error')}
            </Typography>
            <TouchableOpacity
              style={style.retryButton}
              onPress={() => void controller.loadUserProfile()}
              activeOpacity={0.7}
            >
              <Typography variant="body2" style={style.retryButtonText}>
                {t('common.retry')}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </AuthenticatedLayout>
    )
  }

  const user = controller.authState.user.props
  const person = user.person?.props
  const employee = person?.employee?.props

  const getFirstInitial = (firstName: string): string => {
    const firstInitial = firstName && firstName.trim() !== '' ? firstName.charAt(0) : ''
    return firstInitial !== '' ? firstInitial.toUpperCase() : 'U'
  }

  const getFullName = (): string => {
    if (!person) return '---'
    const fullName = `${controller.getSafeValue(person.firstname)} ${controller.getSafeValue(person.lastname)} ${controller.getSafeValue(person.secondLastname)}`.trim()
    return fullName !== '' ? fullName : '---'
  }

  const hasProfileImage = (): boolean => {
    return Boolean(employee?.photo && employee.photo.trim() !== '')
  }

  return (
    <AuthenticatedLayout>
      <View style={style.container}>
        <StatusBar
          style={controller.themeType === 'light' ? 'dark' : 'light'}
        />

        <SafeAreaView style={style.safeAreaContent}>
          <ScrollView
            contentContainerStyle={style.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Header con animación */}
            <AnimatedView 
              entering={FadeInDown.delay(100).duration(400)}
              style={style.header}
            >
              <Typography variant="h1" textAlign="left" style={style.title}>
                {t('screens.profile.title')}
              </Typography>
              <Typography
                variant="h2"
                textAlign="left"
                fontWeight="normal"
                style={style.subtitle}
              >
                {t('screens.profile.subtitle')}
              </Typography>
            </AnimatedView>

            {/* Tarjeta de perfil principal */}
            <AnimatedView
              entering={ZoomIn.delay(200).duration(400)}
              style={style.profileCard}
            >
              <View style={style.profileHeader}>
                <View style={style.avatarContainer}>
                  {hasProfileImage() && employee?.photo ? (
                    <Image
                      source={{ uri: employee.photo }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Typography variant="h1" style={style.avatarText}>
                      {getFirstInitial(controller.getSafeValue(person?.firstname))}
                    </Typography>
                  )}
                </View>
                <View style={style.profileInfo}>
                  <Typography variant="h2" style={style.profileName}>
                    {getFullName()}
                  </Typography>
                  <Typography variant="body2" style={style.profileRole}>
                    {controller.getSafeValue(employee?.code) || 'Empleado'}
                  </Typography>
                </View>
              </View>
            </AnimatedView>

            {/* Información personal */}
            <AnimatedView
              entering={ZoomIn.delay(350).duration(400)}
              style={style.profileCard}
            >
              <Typography variant="h3" style={style.sectionTitle}>
                {t('screens.profile.personalInfo')}
              </Typography>

              <View style={style.infoRow}>
                <Typography variant="body2" style={style.infoLabel}>
                  {t('screens.profile.email')}
                </Typography>
                <Typography variant="body2" style={style.infoValue}>
                  {controller.getSafeEmailValue(user.email)}
                </Typography>
              </View>

              <View style={style.infoRow}>
                <Typography variant="body2" style={style.infoLabel}>
                  {t('screens.profile.phone')}
                </Typography>
                <Typography variant="body2" style={style.infoValue}>
                  {controller.getSafeValue(person?.phone)}
                </Typography>
              </View>

              <View style={style.infoRow}>
                <Typography variant="body2" style={style.infoLabel}>
                  {t('screens.profile.gender')}
                </Typography>
                <Typography variant="body2" style={style.infoValue}>
                  {controller.getSafeValue(person?.gender)}
                </Typography>
              </View>

              <View style={style.infoRow}>
                <Typography variant="body2" style={style.infoLabel}>
                  {t('screens.profile.birthday')}
                </Typography>
                <Typography variant="body2" style={style.infoValue}>
                  {controller.formatDate(person?.birthday || null)}
                </Typography>
              </View>

              <View style={style.infoRow}>
                <Typography variant="body2" style={style.infoLabel}>
                  {t('screens.profile.maritalStatus')}
                </Typography>
                <Typography variant="body2" style={style.infoValue}>
                  {controller.getSafeValue(person?.maritalStatus)}
                </Typography>
              </View>

              <View style={style.infoRowLast}>
                <Typography variant="body2" style={style.infoLabel}>
                  {t('screens.profile.placeOfBirth')}
                </Typography>
                <Typography variant="body2" style={style.infoValue}>
                  {person?.placeOfBirthCity && person?.placeOfBirthState
                    ? `${person.placeOfBirthCity}, ${person.placeOfBirthState}`
                    : '---'}
                </Typography>
              </View>
            </AnimatedView>

            {/* Información laboral */}
            <AnimatedView
              entering={ZoomIn.delay(500).duration(400)}
              style={style.profileCard}
            >
              <Typography variant="h3" style={style.sectionTitle}>
                {t('screens.profile.workInfo')}
              </Typography>

              <View style={style.infoRow}>
                <Typography variant="body2" style={style.infoLabel}>
                  {t('screens.profile.employeeCode')}
                </Typography>
                <Typography variant="body2" style={style.infoValue}>
                  {controller.getSafeValue(employee?.code)}
                </Typography>
              </View>

              <View style={style.infoRow}>
                <Typography variant="body2" style={style.infoLabel}>
                  {t('screens.profile.payrollNumber')}
                </Typography>
                <Typography variant="body2" style={style.infoValue}>
                  {controller.getSafeValue(employee?.payrollNum)}
                </Typography>
              </View>

              <View style={style.infoRow}>
                <Typography variant="body2" style={style.infoLabel}>
                  {t('screens.profile.hireDate')}
                </Typography>
                <Typography variant="body2" style={style.infoValue}>
                  {controller.formatDate(employee?.hireDate || null)}
                </Typography>
              </View>

              <View style={style.infoRow}>
                <Typography variant="body2" style={style.infoLabel}>
                  {t('screens.profile.contractType')}
                </Typography>
                <Typography variant="body2" style={style.infoValue}>
                  {controller.getSafeValue(employee?.typeOfContract)}
                </Typography>
              </View>

              <View style={style.infoRow}>
                <Typography variant="body2" style={style.infoLabel}>
                  {t('screens.profile.workSchedule')}
                </Typography>
                <Typography variant="body2" style={style.infoValue}>
                  {controller.getSafeValue(employee?.workSchedule)}
                </Typography>
              </View>

              <View style={style.infoRowLast}>
                <Typography variant="body2" style={style.infoLabel}>
                  {t('screens.profile.businessEmail')}
                </Typography>
                <Typography variant="body2" style={style.infoValue}>
                  {controller.getSafeEmailValue(employee?.businessEmail)}
                </Typography>
              </View>
            </AnimatedView>

            {/* Información legal */}
            <AnimatedView
              entering={ZoomIn.delay(650).duration(400)}
              style={style.profileCard}
            >
              <Typography variant="h3" style={style.sectionTitle}>
                {t('screens.profile.legalInfo')}
              </Typography>

              <View style={style.infoRow}>
                <Typography variant="body2" style={style.infoLabel}>
                  {t('screens.profile.curp')}
                </Typography>
                <Typography variant="body2" style={style.infoValue}>
                  {controller.getSafeValue(person?.curp)}
                </Typography>
              </View>

              <View style={style.infoRow}>
                <Typography variant="body2" style={style.infoLabel}>
                  {t('screens.profile.rfc')}
                </Typography>
                <Typography variant="body2" style={style.infoValue}>
                  {controller.getSafeValue(person?.rfc)}
                </Typography>
              </View>

              <View style={style.infoRowLast}>
                <Typography variant="body2" style={style.infoLabel}>
                  {t('screens.profile.imssNss')}
                </Typography>
                <Typography variant="body2" style={style.infoValue}>
                  {controller.getSafeValue(person?.imssNss)}
                </Typography>
              </View>
            </AnimatedView>
          </ScrollView>
        </SafeAreaView>
      </View>
    </AuthenticatedLayout>
  )
}

export default ProfileScreen
