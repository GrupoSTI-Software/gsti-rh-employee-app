
/**
 * Interfaz que define la configuración del sistema
 * @interface ISystemSetting
 */
export interface ISystemSetting {
  /**
   * Nombre comercial del sistema
   * @type {string}
   */
  readonly systemSettingTradeName: string | null

  /**
   * Logo del sistema
   * @type {string}
   */
  readonly systemSettingLogo: string | null

  /**
   * Banner del sistema
   * @type {string}
   */
  readonly systemSettingBanner: string | null

  /**
   * Color del sidebar del sistema
   * @type {string}
   */
  readonly systemSettingSidebarColor: string | null

  /**
   * Favicon del sistema
   * @type {string}
   */
  readonly systemSettingFavicon: string | null
}
