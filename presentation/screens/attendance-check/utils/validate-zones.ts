import {
  booleanPointInPolygon,
  lineString,
  point,
  pointToLineDistance,
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

export function validateZones(
  lat: number,
  lng: number,
  zonas: ZonesArray
): ZoneValidationResult {

  const userPoint = point([lng, lat])

  let closestDistance = Infinity
  let closestZoneIndex: number | null = null

  for (let i = 0; i < zonas.length; i++) {
    const zona = zonas[i]

    // Revisar si está dentro de la zona
    const poly = polygon([zona])
    const inside = booleanPointInPolygon(userPoint, poly)

    if (inside) {
      return {
        inside: true,
        zoneIndex: i,
        distance: 0
      }
    }

    // Calcular la distancia más corta a los bordes
    for (let j = 0; j < zona.length - 1; j++) {
      const segment = lineString([zona[j], zona[j + 1]])
      const dist = pointToLineDistance(userPoint, segment, { units: 'meters' })

      if (dist < closestDistance) {
        closestDistance = dist
        closestZoneIndex = i
      }
    }
  }

  return {
    inside: false,
    zoneIndex: closestZoneIndex,
    distance: closestDistance
  }
}
