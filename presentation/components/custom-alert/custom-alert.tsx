import React from 'react'
import { Modal, Pressable, StyleSheet, Text, View, Platform, Dimensions } from 'react-native'

interface AlertButton {
  text: string
  onPress?: () => void
  style?: 'default' | 'cancel' | 'destructive'
}

interface CustomAlertProps {
  visible: boolean
  title: string
  message: string
  buttons?: AlertButton[]
  onClose: () => void
  onButtonPress?: (button: AlertButton) => void
}

export default function CustomAlert({
  visible,
  title,
  message,
  buttons,
  onClose,
  onButtonPress
}: CustomAlertProps) {
  const handleButtonPress = (button: AlertButton) => {
    if (onButtonPress) {
      onButtonPress(button)
    } else {
      onClose()
      if (button.onPress) {
        button.onPress()
      }
    }
  }

  const getButtonStyle = (button: AlertButton) => {
    switch (button.style) {
      case 'destructive':
        return [styles.button, styles.buttonDestructive]
      case 'cancel':
        return [styles.button, styles.buttonCancel]
      default:
        return [styles.button, styles.buttonDefault]
    }
  }

  const getButtonTextStyle = (button: AlertButton) => {
    switch (button.style) {
      case 'destructive':
        return [styles.buttonText, styles.buttonTextDestructive]
      case 'cancel':
        return [styles.buttonText, styles.buttonTextCancel]
      default:
        return [styles.buttonText, styles.buttonTextDefault]
    }
  }

  // Si no hay botones, usar uno por defecto
  const displayButtons = buttons && buttons.length > 0 
    ? buttons 
    : [{ text: 'OK', style: 'default' as const }]

  if (!visible) return null

  // En web, usar un portal o un componente fijo
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webOverlay}>
        <View style={styles.webBox}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {displayButtons.map((button, index) => (
              <Pressable 
                key={index}
                style={getButtonStyle(button)} 
                onPress={() => handleButtonPress(button)}
              >
                <Text style={getButtonTextStyle(button)}>{button.text}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    )
  }

  return (
    <Modal 
      transparent 
      visible={visible} 
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {displayButtons.map((button, index) => (
              <Pressable 
                key={index}
                style={getButtonStyle(button)} 
                onPress={() => handleButtonPress(button)}
              >
                <Text style={getButtonTextStyle(button)}>{button.text}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const { width, height } = Dimensions.get('window')

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  webOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  },
  box: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10
  },
  webBox: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1a1a1a'
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#4a4a4a',
    lineHeight: 22
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap'
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center'
  },
  buttonDefault: {
    backgroundColor: '#007AFF'
  },
  buttonCancel: {
    backgroundColor: '#f0f0f0'
  },
  buttonDestructive: {
    backgroundColor: '#FF3B30'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  buttonTextDefault: {
    color: 'white'
  },
  buttonTextCancel: {
    color: '#333'
  },
  buttonTextDestructive: {
    color: 'white'
  }
})
