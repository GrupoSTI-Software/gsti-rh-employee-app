import { Ionicons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions } from 'expo-camera'
import fetch from 'node-fetch'
import { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
//import { environment } from '../../../config/environment'

export const FaceScreen: React.FC = () => {
  //const API_URL = environment.API_URL
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef<CameraView | null>(null)
  const [status, setStatus] = useState('📸 Esperando permiso...')
  // const [processing, setProcessing] = useState(false)
  // const [ready, setReady] = useState(false)

  const BACKEND_URL =  'http://192.168.100.9:3333/api/verify-face'
  //console.log(BACKEND_URL)

  useEffect(() => {
    void (async () => {
      if (!permission?.granted) {
        await requestPermission()
      } else {
        // setReady(true)
        setStatus('✅ Cámara lista')
      }
    })()
  }, [permission])

  /*   useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    if (ready && cameraRef.current) {
      interval = setInterval(async () => {
        if (!processing) {
          await captureAndSend()
        }
      }, 5000) // cada 2 segundos
    }

    return () => clearInterval(interval)
  }, [ready, processing]) */
  const captureAndSend = async () => {
    if (!cameraRef.current) return
    // setProcessing(true)
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.4
        })

        setStatus('⏳ Enviando al servidor...')
        //console.log(photo.base64)
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: photo.base64 })
        })
        //console.log(response)
        const data = await response.json()

        //console.log(data)
        if (data.match) {
          setStatus(`✅ Misma persona (distancia: ${Number(data?.distance).toFixed(2)})`)
        } else {
          setStatus(`❌ Persona diferente (distancia: ${Number(data?.distance).toFixed(2) ?? 'N/A'})`)
        }
      } catch (err) {
        //console.error(err)
        setStatus('⚠️ Error enviando imagen ' + err)
      }

    }
    // setProcessing(false)
  }

  if (!permission) {
    return <View style={styles.container}><Text>Solicitando permisos...</Text></View>
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>No hay acceso a la cámara.</Text>
        <Text onPress={requestPermission}>Tocar para permitir</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front" />
      
      <View style={styles.overlay}>
        <View style={styles.oval} />
        
        <TouchableOpacity onPress={captureAndSend} style={styles.captureButton}>
          <Ionicons name="scan-outline" size={32} color="black" />
        </TouchableOpacity>

        <Text style={styles.text}>{status}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80
  },
  oval: {
    width: 250,
    height: 350,
    borderWidth: 2,
    borderColor: '#fff',
    borderStyle: 'dashed',
    borderRadius: 200,
    backgroundColor: 'transparent'
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40
  },
  text: {
    position: 'absolute',
    top: 60,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    marginTop: 20,
    borderRadius: 8
  },
  buttonText: { color: '#fff' }
})
export default FaceScreen
