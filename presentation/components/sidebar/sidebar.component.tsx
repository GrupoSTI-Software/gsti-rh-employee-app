import { t } from 'i18next'
import React from 'react'
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity
} from 'react-native'
import Animated, {
  Extrapolate,
  FadeIn,
  FadeInRight,
  SlideInLeft,
  interpolate,
  useAnimatedStyle
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ClockIcon } from '../../icons/clock-icon/clock.icon'
import { CloseSidebarIcon } from '../../icons/close-sidebar-icon/close-sidebar.icon'
import { CogIcon } from '../../icons/cog-icon/cog.icon'
import { LogoutIcon } from '../../icons/logout-icon/logout.icon'
import { ProfileIcon } from '../../icons/profile-icon/profile.icon'
import SidebarItem from '../sidebar-item/sidebar-item.component'
import SidebarController from './sidebar.controller'
import useSidebarStyles from './sidebar.style'
import { ISidebarProps } from './types/sidebar-props.interface'

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

/**
 * Componente Sidebar para la aplicación
 * @param {ISidebarProps} props - Propiedades del sidebar
 * @returns {JSX.Element} Componente Sidebar
 */
const SidebarLayout: React.FC<ISidebarProps> = ({ isOpen, onClose }) => {
  const controller = SidebarController({ isOpen, onClose })
  const styles = useSidebarStyles()

  const sidebarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: controller.translateX.value }]
    }
  })

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: controller.overlayOpacity.value,
      pointerEvents: controller.overlayOpacity.value > 0 ? 'auto' : 'none'
    }
  })

  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      controller.overlayOpacity.value,
      [0, 1],
      [0, 0.5],
      Extrapolate.CLAMP
    )
    return {
      opacity
    }
  })

  return (
    <>
      {/* Overlay con animación */}
      <Animated.View 
        style={[styles.overlay, overlayAnimatedStyle, backdropStyle]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={controller.onClose}
        />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, sidebarAnimatedStyle]}>
        <SafeAreaView
          edges={['top']}
          style={styles.safeAreaView}
        >
          {/* Botón de cerrar con animación sutil */}
          {isOpen && (
            <AnimatedTouchableOpacity
              entering={FadeIn.delay(100).duration(200)}
              style={[styles.closeButton, { top: controller.insets.top + 15 }]}
              onPress={controller.onClose}
            >
              <CloseSidebarIcon color={styles.sidebarIcon.color} />
            </AnimatedTouchableOpacity>
          )}

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Perfil con animación sutil */}
            {isOpen && (
              <Animated.View 
                entering={FadeInRight.delay(50).duration(250)}
                style={styles.profileSection}
              >
                {controller.authUserAvatarType === 'image' ? (
                  <Animated.View 
                    entering={FadeIn.delay(100).duration(200)}
                    style={styles.avatarWrapper}
                  >
                    <Image
                      source={{ uri: controller.authUserAvatarSource }}
                      style={styles.avatar}
                    />
                  </Animated.View>
                ) : (
                  <Animated.View 
                    entering={FadeIn.delay(100).duration(200)}
                    style={styles.avatarTextWrapper}
                  >
                    <Text style={styles.avatarText}>{controller.authUserAvatarSource}</Text>  
                  </Animated.View>
                )}
                
                <Animated.Text 
                  entering={FadeInRight.delay(150).duration(200)}
                  style={styles.profileName}
                >
                  {controller.authUserName()}
                </Animated.Text>
                
                <Animated.Text 
                  entering={FadeInRight.delay(180).duration(200)}
                  style={styles.profileEmail}
                >
                  {controller.authUserEmail()}
                </Animated.Text>
              </Animated.View>
            )}

            {/* Menú principal con animaciones sutiles */}
            {isOpen && (
              <Animated.View 
                entering={SlideInLeft.delay(100).duration(200)}
                style={styles.menuGroup}
              >
                <SidebarItem
                  icon={<ClockIcon color={styles.sidebarIcon.color} />}
                  label={t('sidebar.menuLinks.checkAttendance')}
                  textColor={styles.sidebarIconText.color}
                  onPress={() => { controller.navigateTo('attendanceCheck') }}
                  delay={200}
                />
              </Animated.View>
            )}

            {isOpen && (
              <Animated.View 
                entering={FadeIn.delay(150).duration(150)}
                style={styles.separator} 
              />
            )}

            {/* Perfil */}
            {isOpen && (
              <Animated.View 
                entering={SlideInLeft.delay(120).duration(200)}
                style={styles.menuGroup}
              >
                <SidebarItem
                  icon={<ProfileIcon color={styles.sidebarIcon.color} />}
                  label={t('sidebar.menuLinks.profile')}
                  textColor={styles.sidebarIconText.color}
                  onPress={() => { controller.navigateTo('profile') }}
                  delay={250}
                />
              </Animated.View>
            )}

            {/* Configuración */}
            {isOpen && (
              <Animated.View 
                entering={SlideInLeft.delay(140).duration(200)}
                style={styles.menuGroup}
              >
                <SidebarItem
                  icon={<CogIcon color={styles.sidebarIcon.color} />}
                  label={t('sidebar.menuLinks.settings')}
                  textColor={styles.sidebarIconText.color}
                  onPress={() => { controller.navigateTo('settingsScreen') }}
                  delay={300}
                />
              </Animated.View>
            )}

            {isOpen && (
              <Animated.View 
                entering={FadeIn.delay(180).duration(150)}
                style={styles.separator} 
              />
            )}

            {/* Configuración API */}
            {isOpen && (
              <Animated.View 
                entering={SlideInLeft.delay(140).duration(200)}
                style={styles.menuGroup}
              >
                <SidebarItem
                  icon={<CogIcon color={styles.sidebarIcon.color} />}
                  label={`${t('sidebar.menuLinks.settings')} API`}
                  textColor={styles.sidebarIconText.color}
                  onPress={() => { controller.navigateTo('apiConfig') }}
                  delay={300}
                />
              </Animated.View>
            )}

            {isOpen && (
              <Animated.View 
                entering={FadeIn.delay(180).duration(150)}
                style={styles.separator} 
              />
            )}

            {/* Logout */}
            {isOpen && (
              <Animated.View 
                entering={SlideInLeft.delay(160).duration(200)}
                style={styles.menuGroup}
              >
                {/* <SidebarItem
                  icon={<ChangeAccountIcon color={styles.sidebarIcon.color} />}
                  label={t('sidebar.menuLinks.changeAccount')}
                  textColor={styles.sidebarIconText.color}
                  onPress={controller.handleFullLogout}
                  delay={350}
                /> */}
                <SidebarItem
                  icon={<LogoutIcon color={styles.logoutIcon.color} />}
                  label={t('sidebar.menuLinks.logout')}
                  labelStyle={{ color: styles.logoutIcon.color }}
                  onPress={controller.handleLogout}
                  delay={380}
                />
              </Animated.View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </>
  )
}

export default SidebarLayout
