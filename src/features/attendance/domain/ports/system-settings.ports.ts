import { SystemSettingEntity } from '../entities/system-setting-entity'

/**
 * Interfaz que define los puertos de configuración del sistema para la comunicación con servicios externos
 * @interface SystemSettingsPorts
 */
export interface SystemSettingsPorts {
  /**
   * Obtiene las configuracion activa del sistema
   * @returns {Promise<SystemSettingEntity | null>} Promesa que resuelve la configuración activa del sistema o null si no existe
   */
  getSystemSettings(): Promise<SystemSettingEntity | null>
}
