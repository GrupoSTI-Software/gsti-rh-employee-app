import { GetSystemSettingsUsecase } from '../../../application/get-system-setting/get-system-settings.usecase'
import { SystemSettingEntity } from '../../../domain/entities/system-setting-entity'
import { SystemSettingsRepository } from '../../repositories/get-system-setting/system-setting.repository'

/**
 * Controlador para obtener la configuración del sistema
 * @class GetSystemSettingsController
 */
export class GetSystemSettingsController {
  private readonly repository: SystemSettingsRepository
  private readonly usecase: GetSystemSettingsUsecase

  /**
   * Constructor del controlador de configuración del sistema
   */
  constructor() {
    this.repository = new SystemSettingsRepository()
    this.usecase = new GetSystemSettingsUsecase(this.repository)
  }

  /**
   * Obtiene la configuración del sistema
   * @returns {Promise<SystemSettingEntity | null>} Promesa que resuelve la configuración del sistema o null si no existe
   */
  async getSystemSettings(): Promise<SystemSettingEntity | null> {
    return await this.usecase.run()
  }
}
