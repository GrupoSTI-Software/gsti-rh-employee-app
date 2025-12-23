import { t } from 'i18next'
import { getApi } from '../../../../../../presentation/utils/get-api-url'
import { HttpService } from '../../../../../shared/infrastructure/services/http-service'
import { SystemSettingEntity } from '../../../domain/entities/system-setting-entity'
import { SystemSettingsPorts } from '../../../domain/ports/system-settings.ports'
import { ISystemSettingResponse } from '../../../domain/types/system-setting-response.interface'


/**
 * Repositorio que implementa la comunicación con la API para obtener la configuracion activa del sistema
 * @class SystemSettingsRepository
 */
export class SystemSettingsRepository implements Pick<SystemSettingsPorts, 'getSystemSettings'>
{
  /**
   * Obtiene la configuración del sistema
   * @returns {Promise<SystemSettingEntity | null>} Configuración del sistema o null si no existe
   */
  async getSystemSettings(): Promise<SystemSettingEntity | null> {
    const apiUrl = await getApi()
    const response: ISystemSettingResponse = await (await HttpService.getInstance()).get(`${apiUrl}/system-settings-active`)
    
    if (response.status !== 200) {
      throw new Error(t('errors.errorFetchingSystemSettings'))
    }

    if (response.data.data.systemSetting) {
      const systemSetting = new SystemSettingEntity({
        systemSettingLogo: response.data.data.systemSetting.systemSettingLogo,
        systemSettingBanner: response.data.data.systemSetting.systemSettingBanner,
        systemSettingSidebarColor: response.data.data.systemSetting.systemSettingSidebarColor,
        systemSettingFavicon: response.data.data.systemSetting.systemSettingFavicon,
        systemSettingTradeName: response.data.data.systemSetting.systemSettingTradeName
      })
      return systemSetting as SystemSettingEntity
    } else {
      return null
    }
  
   
   
    
   
  }
}
