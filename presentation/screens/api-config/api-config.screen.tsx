import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import { Button } from '../../components/button/button.component'

import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../navigation/types/types'
import { TextInput } from '../../components/text-input/text-input.component'
import { ApiConfigScreenController } from './api-config.screen.controller'
import useApiConfigStyle from './api-config.style'

/**
 * @description ApiConfigScreen es la pantalla que muestra la información del api
 * @returns {React.FC}
 */
export const ApiConfigScreen: React.FC = () => {
  
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const controller = ApiConfigScreenController()
  const styles = useApiConfigStyle()
  const { t } = useTranslation()
  const [apiUrl, setApiUrl] = useState('')

  // Cargar al iniciar
  useEffect(() => {
    const load = async () => {
      const saved = await controller.loadApi()
      if (saved) setApiUrl(saved)
    }
    void load()
  }, [])

  // Guardar
  const handleSave = async () => {
    if (!apiUrl.trim()) {
      Alert.alert( t('screens.apiConfig.validation'), t('screens.apiConfig.urlCannotBeEmpty'))
      return
    }

    if (!controller.isValidUrl(apiUrl)) {
      Alert.alert(t('screens.apiConfig.validation'), t('screens.apiConfig.invalidUrl'))
      return
    }

    const ok = await controller.saveApiUrl(apiUrl)

    Alert.alert(ok ? t('screens.apiConfig.success') : 'Error',
      ok ? t('screens.apiConfig.urlSavedSuccessfully') : t('screens.apiConfig.couldNotBeSaved'))
    if (ok) {
      if (controller.isAuthenticated) {
        void controller.handleLogout()
      } else {
        navigation.replace('attendanceCheck')
      }
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={controller.goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={32} style={styles.iconBack}/>
        </TouchableOpacity>
        <Text style={styles.title}>{ t('screens.apiConfig.title') }</Text>
        <TextInput
          label={`${t('screens.apiConfig.url')}`}
          value={apiUrl}
          onChangeText={(text) => setApiUrl(text.toLowerCase())}
          leftIcon='link'
        />
        <Button title={`${t('screens.apiConfig.save')}`} onPress={handleSave} />
      </View>
    </SafeAreaView>
  )
}
export default ApiConfigScreen
