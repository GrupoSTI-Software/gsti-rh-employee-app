import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react'
import { Platform, View, StyleSheet, Text, TouchableOpacity } from 'react-native'

// Tipo para el componente nativo de cámara
type NativeCameraRef = {
  takePictureAsync: (options?: { base64?: boolean; quality?: number }) => Promise<{ uri: string; base64?: string } | undefined>
}

// Importar expo-camera solo si no estamos en web
let ExpoCameraView: React.ComponentType<any> | null = null
let useExpoCameraPermissions: (() => [
  { status: string; granted: boolean; canAskAgain: boolean } | null,
  () => Promise<{ status: string; granted: boolean }>
]) | null = null

if (Platform.OS !== 'web') {
  const expoCamera = require('expo-camera') as {
    CameraView: React.ComponentType<any>
    useCameraPermissions: typeof useExpoCameraPermissions
  }
  ExpoCameraView = expoCamera.CameraView
  useExpoCameraPermissions = expoCamera.useCameraPermissions
}

export interface CameraRef {
  takePictureAsync: (options?: { base64?: boolean; quality?: number }) => Promise<{ uri: string; base64?: string } | undefined>
}

interface CameraProps {
  facing?: 'front' | 'back'
  style?: any
}

/**
 * Componente de cámara multiplataforma
 * Usa expo-camera en nativo y getUserMedia en web
 */
const Camera = forwardRef<CameraRef, CameraProps>(({ facing = 'front', style }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nativeCameraRef = useRef<NativeCameraRef>(null)
  const [webStream, setWebStream] = useState<MediaStream | null>(null)
  const [webError, setWebError] = useState<string | null>(null)
  const [isWebCameraReady, setIsWebCameraReady] = useState(false)

  const initWebCamera = async () => {
    try {
      setWebError(null)
      
      // Detener stream anterior si existe
      if (webStream) {
        webStream.getTracks().forEach(track => track.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing === 'front' ? 'user' : 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      })

      setWebStream(stream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          void videoRef.current?.play()
          setIsWebCameraReady(true)
        }
      }
    } catch (err: unknown) {
      const error = err as Error & { name?: string }
      console.error('Error initializing web camera:', error)
      if (error.name === 'NotAllowedError') {
        setWebError('Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración del navegador.')
      } else if (error.name === 'NotFoundError') {
        setWebError('No se encontró ninguna cámara en este dispositivo.')
      } else if (error.name === 'NotSupportedError' || error.name === 'TypeError') {
        setWebError('Tu navegador no soporta acceso a la cámara. Intenta con Chrome o Firefox.')
      } else {
        setWebError(`Error al acceder a la cámara: ${error.message}`)
      }
    }
  }

  // Inicializar cámara web
  useEffect(() => {
    if (Platform.OS === 'web') {
      void initWebCamera()
      return () => {
        // Limpiar stream al desmontar
        if (webStream) {
          webStream.getTracks().forEach(track => track.stop())
        }
      }
    }
  }, [facing])

  const takeWebPicture = async (options?: { base64?: boolean; quality?: number }): Promise<{ uri: string; base64?: string } | undefined> => {
    if (!videoRef.current || !canvasRef.current || !isWebCameraReady) {
      console.error('Camera not ready')
      return undefined
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return undefined

    // Configurar dimensiones del canvas
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Dibujar el frame actual del video en el canvas
    // Espejear horizontalmente si es cámara frontal
    if (facing === 'front') {
      context.translate(canvas.width, 0)
      context.scale(-1, 1)
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convertir a base64
    const quality = options?.quality ?? 0.8
    const dataUrl = canvas.toDataURL('image/jpeg', quality)
    const base64 = options?.base64 ? dataUrl.split(',')[1] : undefined

    return {
      uri: dataUrl,
      base64
    }
  }

  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    takePictureAsync: async (options?: { base64?: boolean; quality?: number }) => {
      if (Platform.OS === 'web') {
        return takeWebPicture(options)
      } else if (nativeCameraRef.current) {
        return nativeCameraRef.current.takePictureAsync(options)
      }
      return undefined
    }
  }))

  // Renderizar cámara web
  if (Platform.OS === 'web') {
    if (webError) {
      return (
        <View style={[styles.container, style]}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{webError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => void initWebCamera()}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    return (
      <View style={[styles.container, style]}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: facing === 'front' ? 'scaleX(-1)' : 'none'
          }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </View>
    )
  }

  // Renderizar cámara nativa
  if (ExpoCameraView) {
    return (
      <ExpoCameraView
        ref={nativeCameraRef}
        style={[styles.container, style]}
        facing={facing}
      />
    )
  }

  return null
})

Camera.displayName = 'Camera'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a'
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
})

export default Camera

// Hook para permisos de cámara multiplataforma
export function useCameraPermissions(): [
  { status: string; granted: boolean; canAskAgain: boolean } | null,
  () => Promise<{ status: string; granted: boolean }>
  ] {
  const [webPermission, setWebPermission] = useState<{
    status: string
    granted: boolean
    canAskAgain: boolean
  } | null>(null)

  // En nativo, usar el hook de expo-camera
  if (Platform.OS !== 'web' && useExpoCameraPermissions) {
    return useExpoCameraPermissions()
  }

  const checkWebPermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.permissions) {
        setWebPermission({
          status: 'granted', // Asumir granted si no podemos verificar
          granted: true,
          canAskAgain: true
        })
        return
      }

      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      
      setWebPermission({
        status: result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'undetermined',
        granted: result.state === 'granted',
        canAskAgain: result.state !== 'denied'
      })

      // Escuchar cambios en los permisos
      result.addEventListener('change', () => {
        setWebPermission({
          status: result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'undetermined',
          granted: result.state === 'granted',
          canAskAgain: result.state !== 'denied'
        })
      })
    } catch {
      // Si no podemos verificar permisos, asumir que se puede preguntar
      setWebPermission({
        status: 'undetermined',
        granted: false,
        canAskAgain: true
      })
    }
  }

  // En web, verificar permisos
  useEffect(() => {
    void checkWebPermission()
  }, [])

  const requestWebPermission = async (): Promise<{ status: string; granted: boolean }> => {
    try {
      // En web, solicitar permisos abriendo el stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop()) // Detener inmediatamente
      
      setWebPermission({
        status: 'granted',
        granted: true,
        canAskAgain: true
      })

      return { status: 'granted', granted: true }
    } catch (err: unknown) {
      const error = err as Error & { name?: string }
      const isDenied = error.name === 'NotAllowedError'
      
      setWebPermission({
        status: isDenied ? 'denied' : 'undetermined',
        granted: false,
        canAskAgain: !isDenied
      })

      return { status: isDenied ? 'denied' : 'undetermined', granted: false }
    }
  }

  return [webPermission, requestWebPermission]
}
