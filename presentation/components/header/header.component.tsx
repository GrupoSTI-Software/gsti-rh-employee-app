import { Image, TouchableOpacity, View } from 'react-native'
import Animated, {
  BounceIn,
  FadeInRight,
  runOnJS,
  SlideInLeft,
  SlideInRight,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppTheme } from '../../theme/theme-context'
import { Typography } from '../typography/typography.component'
import SidebarIcon from './assets/sidebar.icon'
import HeaderLayoutController from './header.controller'
import useHeaderLayoutStyle from './header.style'
import IHeaderProps from './types/header-props.interface'

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

/**
 * Componente Header para la aplicación
 * @param {Function} props.onMenuPress - Función a ejecutar cuando se presiona el botón de menú
 * @returns {JSX.Element} Componente Header
 */
const Header: React.FC<IHeaderProps> = ({ onMenuPress }) => {
  const styles = useHeaderLayoutStyle()
  const controller = HeaderLayoutController()
  const { isFirstLaunch } = useAppTheme()
  
  const menuButtonScale = useSharedValue(1)

  const handleMenuPress = () => {
    menuButtonScale.value = withSpring(0.9, {
      duration: 100,
      dampingRatio: 0.6
    }, () => {
      menuButtonScale.value = withSpring(1, {
        duration: 200,
        dampingRatio: 0.8
      })
      if (onMenuPress) {
        runOnJS(onMenuPress)()
      }
    })
  }

  const menuButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: menuButtonScale.value }]
    }
  })

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea]}>
      <Animated.View 
        entering={isFirstLaunch ? SlideInUp.delay(100).duration(900).springify().damping(12) : undefined}
        style={[styles.header]}
      >
        {/* Botón de menú con animación */}
        <Animated.View
          entering={isFirstLaunch ? SlideInLeft.delay(500).duration(800).springify().damping(10) : undefined}
        >
          <AnimatedTouchableOpacity 
            onPress={handleMenuPress} 
            style={[styles.menuButton, menuButtonAnimatedStyle]}
            activeOpacity={1}
          >
            <SidebarIcon color={styles.sidebarIconColor.color} />
          </AnimatedTouchableOpacity>
        </Animated.View>

        {/* Contenedor derecho con animación */}
        <Animated.View 
          entering={isFirstLaunch ? SlideInRight.delay(700).duration(900).springify().damping(10) : undefined}
          style={styles.rightContainer}
        >
          <Animated.View
            entering={isFirstLaunch ? FadeInRight.delay(1100).duration(800).springify() : undefined}
          >
            <Typography variant="h3" style={[styles.greeting]}>
              {controller.authUserName}
            </Typography>
          </Animated.View>

          {/* Avatar con animación */}
          <Animated.View
            entering={isFirstLaunch ? BounceIn.delay(1400).duration(1000) : undefined}
          >
            {controller.authUserAvatarType === 'image' ? (
              <Image
                source={{ uri: controller.authUserAvatarSource }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarTextWrapper}>
                <Typography variant="body2" style={styles.avatarText}>
                  {controller.authUserAvatarSource}
                </Typography>  
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  )
}

export default Header
