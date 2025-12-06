import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  View
} from 'react-native'
import { Button } from '../../components/button/button.component'

import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../navigation/types/types'
import { Typography } from '../../components/typography/typography.component'
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
        <Text style={styles.title}>{ t('screens.apiConfig.title') }</Text>
        <Typography
          variant='h2'
          textAlign='left'
          fontWeight='normal'
          style={styles.subtitle}
        >
          {t('screens.apiConfig.url')}
        </Typography>
        <TextInput
          style={styles.input}
          placeholder={`${t('screens.apiConfig.placeholder')}`}
          value={apiUrl}
          onChangeText={setApiUrl}
          autoCapitalize='none'
        />
        <Button title={`${t('screens.apiConfig.save')}`} onPress={handleSave} />
      </View>
    </SafeAreaView>
  )
}
export default ApiConfigScreen
