import { ISystemSetting } from '../types/system-setting.interface'

/**
 * Entidad que representa la configuración del sistema
 * @class SystemSettingEntity
 */
export class SystemSettingEntity {
  /**
   * Constructor de la entidad de configuración del sistema
   * @param {ISystemSetting} properties - Propiedades de la configuración del sistema
   */
  constructor(private readonly properties: ISystemSetting) {}

  /**
   * Obtiene las propiedades de la configuración del sistema
   * @returns {ISystemSetting} Propiedades de la configuración activa del sistema
   */
  get props(): ISystemSetting {
    return this.properties
  }
}
