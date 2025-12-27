import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Platform, Image } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PWAService } from '../../../src/shared/infrastructure/services/pwa-service'
import usePWARequiredStyle from './pwa-required.style'

/**
 * Detecta si el navegador es iOS Safari
 */
const isIOSSafari = (): boolean => {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const isWebkit = /WebKit/.test(ua)
  const isChrome = /CriOS/.test(ua)
  return isIOS && isWebkit && !isChrome
}

/**
 * Detecta si el navegador es Chrome en Android
 */
const isChromeAndroid = (): boolean => {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /Android/.test(ua) && /Chrome/.test(ua)
}

/**
 * Props del componente PWARequiredScreen
 */
interface PWARequiredScreenProps {
  /** Nombre de la app a mostrar */
  appName?: string
  /** URL del logo */
  logoUrl?: string
}

/**
 * Pantalla que se muestra cuando la app se ejecuta en un navegador
 * y no está instalada como PWA
 */
export const PWARequiredScreen: React.FC<PWARequiredScreenProps> = ({
  appName = 'SAE Empleados',
  logoUrl
}) => {
  const styles = usePWARequiredStyle()
  const { t } = useTranslation()
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    if (Platform.OS !== 'web') return

    const updateInstallState = () => {
      setCanInstall(PWAService.canInstall())
    }

    updateInstallState()

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', updateInstallState)
      window.addEventListener('appinstalled', () => {
        // Recargar la página cuando se instale la app
        window.location.reload()
      })

      return () => {
        window.removeEventListener('beforeinstallprompt', updateInstallState)
      }
    }
  }, [])

  const handleInstall = useCallback(async () => {
    const installed = await PWAService.promptInstall()
    if (installed) {
      // La app fue instalada, recargar
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }, [])

  const renderInstallSteps = () => {
    if (isIOSSafari()) {
      return (
        <>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepText}>
                {t('pwa.iosStep1', { defaultValue: 'Toca el botón ' })}
                <Text style={styles.stepHighlight}>Compartir</Text>
                {t('pwa.iosStep1b', { defaultValue: ' (icono cuadrado con flecha)' })}
              </Text>
            </View>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepText}>
                {t('pwa.iosStep2', { defaultValue: 'Desplázate y selecciona ' })}
                <Text style={styles.stepHighlight}>"Añadir a pantalla de inicio"</Text>
              </Text>
            </View>
          </View>
          <View style={[styles.stepRow, { marginBottom: 0 }]}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepText}>
                {t('pwa.iosStep3', { defaultValue: 'Toca ' })}
                <Text style={styles.stepHighlight}>"Añadir"</Text>
                {t('pwa.iosStep3b', { defaultValue: ' para confirmar' })}
              </Text>
            </View>
          </View>
        </>
      )
    }

    if (isChromeAndroid() || canInstall) {
      return (
        <>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepText}>
                {t('pwa.androidStep1', { defaultValue: 'Toca el botón ' })}
                <Text style={styles.stepHighlight}>"Instalar"</Text>
                {t('pwa.androidStep1b', { defaultValue: ' de abajo' })}
              </Text>
            </View>
          </View>
          <View style={[styles.stepRow, { marginBottom: 0 }]}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepText}>
                {t('pwa.androidStep2', { defaultValue: 'Confirma la instalación y abre la app desde tu pantalla de inicio' })}
              </Text>
            </View>
          </View>
        </>
      )
    }

    // Instrucciones genéricas para otros navegadores
    return (
      <>
        <View style={styles.stepRow}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepText}>
              {t('pwa.genericStep1', { defaultValue: 'Abre el menú del navegador (⋮ o ⋯)' })}
            </Text>
          </View>
        </View>
        <View style={styles.stepRow}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepText}>
              {t('pwa.genericStep2', { defaultValue: 'Busca la opción ' })}
              <Text style={styles.stepHighlight}>"Instalar aplicación"</Text>
              {t('pwa.genericStep2b', { defaultValue: ' o "Añadir a pantalla de inicio"' })}
            </Text>
          </View>
        </View>
        <View style={[styles.stepRow, { marginBottom: 0 }]}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepText}>
              {t('pwa.genericStep3', { defaultValue: 'Confirma y abre la app desde tu pantalla de inicio' })}
            </Text>
          </View>
        </View>
      </>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.gradient}>
        {/* Logo opcional */}
        {logoUrl && (
          <View style={styles.logoContainer}>
            <Image source={{ uri: logoUrl }} style={styles.logo} />
          </View>
        )}

        <View style={styles.content}>
          {/* Icono principal */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconEmoji}>📲</Text>
          </View>

          {/* Título */}
          <Text style={styles.title}>
            {t('pwa.requiredTitle', { defaultValue: 'Instala la aplicación' })}
          </Text>

          {/* Subtítulo */}
          <Text style={styles.subtitle}>
            {t('pwa.requiredSubtitle', {
              defaultValue: 'Para usar {{appName}}, necesitas instalarla en tu dispositivo. Es rápido y no ocupa casi espacio.',
              appName
            })}
          </Text>

          {/* Pasos de instalación */}
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>
              {t('pwa.howToInstall', { defaultValue: 'Cómo instalar' })}
            </Text>
            {renderInstallSteps()}
          </View>

          {/* Botón de instalación (solo si está disponible el prompt) */}
          {canInstall ? (
            <TouchableOpacity
              style={styles.installButton}
              onPress={handleInstall}
              accessibilityLabel={t('pwa.installButton', { defaultValue: 'Instalar aplicación' })}
              accessibilityRole="button"
            >
              <Text style={styles.installButtonText}>
                {t('pwa.installButton', { defaultValue: 'Instalar aplicación' })}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={[styles.installButton, styles.installButtonDisabled]}>
                <Text style={[styles.installButtonText, styles.installButtonTextDisabled]}>
                  {t('pwa.followSteps', { defaultValue: 'Sigue los pasos de arriba' })}
                </Text>
              </View>
              
              {/* Hint para iOS */}
              {isIOSSafari() && (
                <View style={styles.browserHint}>
                  <Text style={styles.browserHintIcon}>💡</Text>
                  <Text style={styles.browserHintText}>
                    {t('pwa.iosHint', { defaultValue: 'En Safari, el botón Compartir está en la barra inferior' })}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default PWARequiredScreen

