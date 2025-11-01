import { ILocationCoordinates, LocationService } from '../../../../src/features/authentication/infrastructure/services/location.service'

/**
 * Valida la ubicación en segundo plano con configuración optimizada
 * @returns {Promise<ILocationCoordinates>}
 */
export const validateLocationInBackground = async (): Promise<ILocationCoordinates> => {
  // Usar configuración más rápida para no bloquear la UX
  const locationService = new LocationService()
  return await locationService.getValidatedLocation(50) // Precisión menos estricta: 50m vs 30m
}
