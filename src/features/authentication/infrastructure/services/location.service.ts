import * as Location from 'expo-location'
import i18next from 'i18next'
import { Platform } from 'react-native'

/**
 * Interfaz para las coordenadas de ubicación
 * @interface ILocationCoordinates
 */
export interface ILocationCoordinates {
  /**
   * Latitud
   * @type {number}
   */
  latitude: number

  /**
   * Longitud
   * @type {number}
   */
  longitude: number

  /**
   * Precisión en metros
   * @type {number}
   */
  accuracy: number

  /**
   * Altitud en metros
   * @type {number | null}
   */
  altitude: number | null

  /**
   * Timestamp de cuando se obtuvo la ubicación
   * @type {number}
   */
  timestamp: number
}

/**
 * Servicio para gestionar la geolocalización del dispositivo
 * @class LocationService
 */
export class LocationService {
  /**
   * Verifica si la ubicación precisa está disponible y habilitada en el dispositivo
   * @returns {Promise<boolean>} Promesa que resuelve a true si la ubicación precisa está disponible
   */
  async isLocationEnabled(): Promise<boolean> {
    try {
      const locationServicesEnabled = await Location.hasServicesEnabledAsync()
      return locationServicesEnabled
    } catch (error) {
      console.error('Error al verificar si la ubicación está habilitada:', error)
      return false
    }
  }

  /**
   * Solicita permisos de ubicación precisa al usuario
   * @returns {Promise<boolean>} Promesa que resuelve a true si se otorgaron los permisos
   */
  async requestLocationPermissions(): Promise<boolean> {
    try {
      // Solicitar permisos básicos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync()
      
      if (status !== 'granted') {
        return false
      }

      // Para obtener mejor precisión, especialmente altitud
      try {
        const backgroundStatus = await Location.requestBackgroundPermissionsAsync()
        console.error('Permisos de fondo:', backgroundStatus.status)
      } catch (error) {
        console.error('No se pudieron obtener permisos de fondo:', error)
        // No es crítico, continuamos con permisos de foreground
      }
      
      return true
    } catch (error) {
      console.error('Error al solicitar permisos de ubicación:', error)
      return false
    }
  }

  /**
   * Obtiene las coordenadas actuales del dispositivo
   * @returns {Promise<ILocationCoordinates>} Promesa que resuelve a las coordenadas de ubicación
   * @throws {Error} Si no se pueden obtener las coordenadas
   */
  async getCurrentLocation(): Promise<ILocationCoordinates> {
    try {
      // Verificar si los servicios de ubicación están habilitados
      const isEnabled = await this.isLocationEnabled()
      if (!isEnabled) {
        throw new Error(i18next.t('errors.locationServicesDisabled'))
      }

      // Verificar permisos
      const { status } = await Location.getForegroundPermissionsAsync()
      if (status !== 'granted') {
        const permissionGranted = await this.requestLocationPermissions()
        if (!permissionGranted) {
          throw new Error(i18next.t('errors.locationPermissionDenied'))
        }
      }

      // Obtener ubicación actual con configuración optimizada para mejor UX
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High, // High en lugar de BestForNavigation para mejor velocidad
        timeInterval: 5000, // Reducido de 10000 a 5000ms
        distanceInterval: 5, // Incrementado de 1 a 5 metros para mejor velocidad
        mayShowUserSettingsDialog: true
      })

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        altitude: this.normalizeAltitude(location.coords.altitude),
        timestamp: location.timestamp
      }
    } catch (error) {
      console.error('Error al obtener la ubicación actual:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error(i18next.t('errors.locationNotAvailable'))
    }
  }

  /**
   * Valida que la ubicación obtenida tenga la precisión requerida
   * @param {ILocationCoordinates} coordinates - Las coordenadas a validar
   * @param {number} requiredAccuracy - La precisión requerida en metros (por defecto 20m)
   * @returns {boolean} True si la ubicación cumple con la precisión requerida
   */
  validateLocationAccuracy(coordinates: ILocationCoordinates, requiredAccuracy: number = 20): boolean {
    return coordinates.accuracy <= requiredAccuracy
  }

  /**
   * Obtiene y valida la ubicación precisa del dispositivo
   * - Verifica que los servicios de ubicación estén habilitados
   * - Solicita permisos si es necesario
   * - Obtiene las coordenadas con alta precisión
   * - Valida que la precisión sea adecuada
   * @param {number} requiredAccuracy - La precisión requerida en metros (por defecto 30m)
   * @returns {Promise<ILocationCoordinates>} Promesa que resuelve a las coordenadas validadas
   * @throws {Error} Si no se puede obtener una ubicación precisa
   */
  async getValidatedLocation(requiredAccuracy: number = 200): Promise<ILocationCoordinates> {
    const coordinates = await this.getCurrentLocation()
    
    if (!this.validateLocationAccuracy(coordinates, requiredAccuracy)) {
      throw new Error(
        i18next.t('errors.locationNotAccurate', { 
          accuracy: coordinates.accuracy, 
          required: requiredAccuracy 
        })
      )
    }

    return coordinates
  }

  /**
   * Normaliza la altitud entre iOS y Android
   * @param {number | null} altitude - La altitud a normalizar
   * @returns {number | null} La altitud normalizada
   */
  normalizeAltitude(altitude: number | null): number | null {
    if (Platform.OS === 'ios') {
      // iOS a veces retorna 0 cuando no puede determinar la altitud
      // o cuando los permisos son limitados
      if (altitude === 0 || altitude === null) {
        return null
      }
      return altitude
    } else if (Platform.OS === 'android') {
      // Android generalmente proporciona altitud más confiable
      return altitude
    }
    return altitude
  }
} 
