import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, View } from 'react-native'
import AppNavigatorController from './app-navigator.controller'
import useAppNavigatorStyle from './app-navigator.style'
import { RootStackParamList } from './types/types'

import ApiConfigScreen from '../presentation/screens/api-config/api-config.screen'
import { AttendanceCheckScreen } from '../presentation/screens/attendance-check/attendance-check.screen'
import AuthenticationScreen from '../presentation/screens/authentication/authentication.screen'
import { BiometricsConfigScreen } from '../presentation/screens/biometrics/biometrics-config.screen'
import { ProfileScreen } from '../presentation/screens/profile'
import { SettingsScreen } from '../presentation/screens/settings/settings.screen'

const Stack = createNativeStackNavigator<RootStackParamList>()

export const AppNavigator: React.FC = () => {
  const controller = AppNavigatorController()
  const styles = useAppNavigatorStyle()

  if (controller.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={controller.getInitialRouteName()}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="authenticationScreen"
          component={AuthenticationScreen}
        />
        <Stack.Screen
          name="biometricsConfigScreen"
          component={BiometricsConfigScreen}
        />
        <Stack.Screen
          name="attendanceCheck"
          component={AttendanceCheckScreen}
        />
        <Stack.Screen
          name="settingsScreen"
          component={SettingsScreen}
        />
        <Stack.Screen
          name="profile"
          component={ProfileScreen}
        />
        <Stack.Screen
          name="apiConfig"
          component={ApiConfigScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
