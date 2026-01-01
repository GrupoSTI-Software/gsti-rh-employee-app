/**
 * Versión de la aplicación
 * Se sincroniza con la versión del package.json y el service worker
 */
export const APP_VERSION = '0.0.9'

/**
 * Obtiene el string de versión formateado para mostrar en la UI
 * @returns {string} Versión formateada (ej: "v0.0.1")
 */
export const getAppVersionDisplay = (): string => {
  return `v${APP_VERSION}`
}

