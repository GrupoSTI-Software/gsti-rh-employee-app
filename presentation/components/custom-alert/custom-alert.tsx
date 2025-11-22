import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'

interface CustomAlertProps {
  visible: boolean
  title: string
  message: string
  onClose: () => void
}

export default function CustomAlert({
  visible,
  title,
  message,
  onClose
}: CustomAlertProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center'
  },
  box: {
    width: '90%',
    height: '85%',
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
})
