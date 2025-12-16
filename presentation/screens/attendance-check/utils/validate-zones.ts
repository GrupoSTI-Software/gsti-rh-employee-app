import {
  booleanPointInPolygon,
  lineString,
  nearestPointOnLine,
  point,
  polygon
} from '@turf/turf'

export type Coordinate = [number, number]
export type Zone = Coordinate[]
export type ZonesArray = Zone[]

export interface ZoneValidationResult {
  inside: boolean
  zoneIndex: number | null
  distance: number
}

export function validateZonesWithDirection(
  lat: number,
  lng: number,
  zonas: ZonesArray
) {
  const userPoint = point([lng, lat])

  let closestDistance = Infinity
  let closestZoneIndex: number | null = null
  let closestDirection: string | null = null

  for (let i = 0; i < zonas.length; i++) {
    const zona = zonas[i]
    const poly = polygon([zona])

    // 1. Si está dentro
    const inside = booleanPointInPolygon(userPoint, poly)
    if (inside) {
      return {
        inside: true,
        zoneIndex: i,
        distance: 0,
        direction: 'inside'
      }
    }

    // 2. Convertir toda la zona a una única línea
    const zoneLine = lineString(zona)

    // 3. Encontrar el punto más cercano en el borde
    const nearest = nearestPointOnLine(zoneLine, userPoint, { units: 'meters' })

    const dist = nearest.properties.dist // metros
    if (dist < closestDistance) {
      closestDistance = dist
      closestZoneIndex = i

      // Calcular dirección
      const [targetLng, targetLat] = nearest.geometry.coordinates
      closestDirection = getDirection(lat, lng, targetLat, targetLng)
    }
  }

  return {
    inside: false,
    zoneIndex: closestZoneIndex,
    distance: closestDistance,
    direction: closestDirection
  }
}

function getDirection(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const dLat = lat2 - lat1
  const dLon = lon2 - lon1

  const angle = Math.atan2(dLon, dLat) * 180 / Math.PI

  const bearing = (angle + 360) % 360

  if (bearing < 22.5 || bearing >= 337.5) return 'north'
  if (bearing < 67.5) return 'northeast'
  if (bearing < 112.5) return 'east'
  if (bearing < 157.5) return 'southeast'
  if (bearing < 202.5) return 'south'
  if (bearing < 247.5) return 'southwest'
  if (bearing < 292.5) return 'west'
  
  return 'northwest'
}
