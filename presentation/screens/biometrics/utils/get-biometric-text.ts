import { TFunction } from 'i18next'

/**
 * Obtiene el texto apropiado para el tipo de biometría
 * @returns {Object} Objeto con el texto y el icono de la biometría
 */
export const getBiometricText = (t: TFunction<'translation'>, hasEnrolledFaceID: boolean
  , hasEnrolledFingerprint: boolean, biometricType: 'face' | 'fingerprint') => {
  if (hasEnrolledFaceID && !hasEnrolledFingerprint) {
    return {
      title: t('screens.biometrics.faceID'),
      description: t('screens.biometrics.faceIDAvailable'),
      icon: 'scan-outline'
    }
  } else if (hasEnrolledFingerprint && !hasEnrolledFaceID) {
    return {
      title: t('screens.biometrics.fingerprint'),
      description: t('screens.biometrics.fingerprintAvailable'),
      icon: 'finger-print'
    }
  } else if (biometricType === 'face') {
    return {
      title: t('screens.biometrics.faceID'),
      description: t('screens.biometrics.primaryBiometricMethod'),
      icon: 'scan-outline'
    }
  } else {
    return {
      title: t('screens.biometrics.fingerprint'),
      description: t('screens.biometrics.primaryBiometricMethod'),
      icon: 'finger-print'
    }
  }
}
