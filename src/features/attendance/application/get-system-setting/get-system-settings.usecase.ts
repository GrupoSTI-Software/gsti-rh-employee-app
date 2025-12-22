import { SystemSettingEntity } from '../../domain/entities/system-setting-entity'
import { SystemSettingsPorts } from '../../domain/ports/system-settings.ports'


/**
 * Caso de uso para obtener la configuración del sistema
 * @class GetSystemSettingsUsecase
 */
export class GetSystemSettingsUsecase {
  /**
   * Constructor del caso de uso para obtener la configuración del sistema
   * @param {Pick<SystemSettingsPorts, 'getSystemSettings'>} systemSettingsPorts - Puerto definido para obtener la configuración del sistema
   */
  constructor(
    private readonly systemSettingsPorts: Pick<SystemSettingsPorts, 'getSystemSettings'>
  ) {}

  /**
   * Ejecuta el caso de uso para obtener la configuración del sistema
   * @returns {Promise<SystemSettingEntity | null>}} Promesa que resuelve a la entidad de configuración del sistema o null si no existe
   */
  async run(): Promise<SystemSettingEntity | null> {
    const systemSettings = await this.systemSettingsPorts.getSystemSettings()
    return systemSettings
  }
}
