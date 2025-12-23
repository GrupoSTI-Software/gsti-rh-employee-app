import { ISystemSetting } from './system-setting.interface'

/**
 * Interfaz que define la respuesta de la configuración del sistema
 * @interface ISystemSettingResponse
 */
export interface ISystemSettingResponse {
    /**
     * Status de la respuesta
     * @type {number}
     */
    status: number
    /**
     * Data de la respuesta
     * @type {object}
     */
    data: {
        data: {
            systemSetting: ISystemSetting
        }
    }
}
