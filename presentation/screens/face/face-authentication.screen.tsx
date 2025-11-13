import { Ionicons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions } from 'expo-camera'
import fetch from 'node-fetch'
import { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { FaceAuthenticationScreenController } from './face-authentication-screen.controller'
//import { environment } from '../../../config/environment'

export const FaceAuthenticationScreen: React.FC = () => {
  const controller = FaceAuthenticationScreenController()
  //const API_URL = environment.API_URL
  // const [isLoading, setIsLoading] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef<CameraView | null>(null)
  const [status, setStatus] = useState('📸 Esperando permiso...')
  // const [processing, setProcessing] = useState(false)
  // const [ready, setReady] = useState(false)

  const BACKEND_URL =  'http://192.168.100.13:3333/api/verify-face'
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

        /*     const frames = [];
        for (let i = 0; i < 3; i++) {
          const photo = await cameraRef.current.takePictureAsync({ base64: true });
          frames.push(photo.base64);
          await new Promise(r => setTimeout(r, 500)); // espera medio segundo
        }

        // luego comparas diferencias de brillo/píxeles
        const diff = compareFrames(frames);
        if (diff < umbral) {
          alert("Parece que estás mostrando una foto. Intenta moverte un poco.");
        } */


        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.4
        })
        // setProcessing(true)
        // setIsLoading(true)
        setStatus('⏳ Enviando al servidor...')
        // console.log('enviando al servidor')
        //console.log(photo.base64)
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: photo.base64 })
        })
        // console.log(response)
        const data = await response.json()

        // console.log(data)
        if (data.match) {
          setStatus(`✅ Misma persona (distancia: ${Number(data?.distance).toFixed(2)})`)
          
          await controller.loginHandler?.('biometric')
       
        
        } else {
          setStatus(`❌ Persona diferente (distancia: ${Number(data?.distance).toFixed(2) ?? 'N/A'})`)
        }
      } catch (err) {
        console.error(err)
        setStatus('⚠️ Error enviando imagen ' + err)
      }

    }
    // setIsLoading(false)
    // setProcessing(false)
  }
  const goBack = () => {
    setStatus('⏳ Atras...')
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
  /*  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    )
  }  */

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front" />
      
      <View style={styles.overlay}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={32} color="black" />
        </TouchableOpacity>
        
        <View style={styles.oval} />
        
        <TouchableOpacity onPress={captureAndSend} style={styles.captureButton}>
          <Ionicons name="scan-outline" size={65} color="black" />
          <View style={styles.innerDot} />
        </TouchableOpacity>

        <Text style={styles.text}>{status}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80
  },
  oval: {
    width: 280,
    height: 550,          
    borderWidth: 3,
    borderColor: '#fff',
    borderStyle: 'dashed',
    borderRadius: 200,
    backgroundColor: 'transparent',
    alignSelf: 'center',
    marginTop: 30
  },
  captureButton: {
    width: 110,
    height: 110,
    borderRadius: 90,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    borderColor: '#000',
    borderWidth: 1
  },
  innerDot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 15,
    backgroundColor: 'black'
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
    borderColor: '#000',
    borderWidth: 1
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
  innerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'black'
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    marginTop: 20,
    borderRadius: 8
  },
  buttonText: { color: '#fff' }
})
export default FaceAuthenticationScreen
