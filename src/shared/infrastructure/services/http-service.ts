import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { t } from 'i18next'
import { getApi } from '../../../../presentation/utils/get-api-url'

/**
 * Servicio HTTP para realizar solicitudes a la API
 * @class HttpServiceClass
 * @singleton
 */
class HttpServiceClass {
  private readonly apiClient: AxiosInstance
  private static instance: HttpServiceClass

  /**
   * Constructor de la clase HttpServiceClass
   */
  private constructor(apiUrl: string) {
    this.apiClient = axios.create({
      baseURL: `${apiUrl}`,
      headers: {
         
        'Content-Type': 'application/json',
         
        Accept: 'application/json'
      }
    })
  }

  /**
   * Obtiene la instancia única de HttpServiceClass (Singleton)
   * Si ya existe una instancia, la retorna directamente sin crear una nueva.
   * Si no existe, intenta crear una nueva con la URL de la API configurada.
   * @returns {Promise<HttpServiceClass>} La instancia única de HttpServiceClass
   * @throws {Error} Si no existe instancia y no hay URL de API configurada
   */
  public static async getInstance(): Promise<HttpServiceClass> {
    // Si ya existe la instancia, retornarla directamente
    if (HttpServiceClass.instance) {
      return HttpServiceClass.instance
    }

    // No existe instancia, intentar crear una nueva
    const apiUrl = await getApi()
    
    if (!apiUrl || apiUrl.trim() === '') {
      throw new Error(t('errors.httpServiceUrlNotConfigured'))
    }

    HttpServiceClass.instance = new HttpServiceClass(apiUrl)
    
    return HttpServiceClass.instance
  }

  /**
   * Verifica si ya existe una instancia creada del servicio HTTP
   * @returns {boolean} true si existe una instancia, false en caso contrario
   */
  public static hasInstance(): boolean {
    return HttpServiceClass.instance !== undefined && HttpServiceClass.instance !== null
  }

  /**
   * Reinicia la instancia del servicio HTTP
   * Útil cuando se necesita cambiar la URL de la API o para testing
   * @returns {void}
   */
  public static resetInstance(): void {
    HttpServiceClass.instance = null as any
  }

  /**
   * Establece el token de autenticación en el encabezado de la solicitud
   * @param {string} token - El token de autenticación a establecer
   * @returns {void}
   */
  setBearerToken(token: string): void {
    this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  /**
   * Elimina el token de autenticación del encabezado de la solicitud
   * @returns {void}
   */
  removeBearerToken(): void {
    delete this.apiClient.defaults.headers.common['Authorization']
  }

  /**
   * Establece una cabecera personalizada en la solicitud
   * @param {string} key - La clave de la cabecera a establecer
   * @param {string} value - El valor de la cabecera a establecer
   * @returns {void}
   */
  setCustomHeader(key: string, value: string): void {
    this.apiClient.defaults.headers.common[key] = value
  }

  /**
   * Elimina una cabecera personalizada de la solicitud
   * @param {string} key - La clave de la cabecera a eliminar
   * @returns {void}
   */
  removeCustomHeader(key: string): void {
    delete this.apiClient.defaults.headers.common[key]
  }

  /**
   * Obtiene la URL de la API
   * @returns {string} La URL de la API
   */
  getAPIUrl(): string {
    return this.apiClient.defaults.baseURL || ''
  }

  /**
   * Obtiene las cabeceras de la API
   * @returns {Record<string, string>} Las cabeceras de la API
   */
  getAPIHeaders(): Record<string, string> {
    return this.apiClient.defaults.headers as Record<string, string>
  }

  /**
   * Realiza una petición GET
   * @param {string} url - La URL a la que realizar la petición
   * @param {AxiosRequestConfig} config - Configuración opcional para la petición
   * @returns {Promise<AxiosResponse<T>>} La respuesta de la petición
   */
  get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.apiClient.get<T>(url, config)
  }

  /**
   * Realiza una petición POST
   * @param {string} url - La URL a la que realizar la petición
   * @param {unknown} data - Los datos a enviar en la petición
   * @param {AxiosRequestConfig} config - Configuración opcional para la petición
   * @returns {Promise<AxiosResponse<T>>} La respuesta de la petición
   */
  post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.apiClient.post<T>(url, data, config)
  }

  /**
   * Realiza una petición PUT
   * @param {string} url - La URL a la que realizar la petición
   * @param {unknown} data - Los datos a enviar en la petición
   * @param {AxiosRequestConfig} config - Configuración opcional para la petición
   * @returns {Promise<AxiosResponse<T>>} La respuesta de la petición
   */
  put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.apiClient.put<T>(url, data, config)
  }

  /**
   * Realiza una petición DELETE
   * @param {string} url - La URL a la que realizar la petición
   * @param {AxiosRequestConfig} config - Configuración opcional para la petición
   * @returns {Promise<AxiosResponse<T>>} La respuesta de la petición
   */
  delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.apiClient.delete<T>(url, config)
  }

  /**
   * Realiza una petición PATCH
   * @param {string} url - La URL a la que realizar la petición
   * @param {unknown} data - Los datos a enviar en la petición
   * @param {AxiosRequestConfig} config - Configuración opcional para la petición
   * @returns {Promise<AxiosResponse<T>>} La respuesta de la petición
   */
  patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.apiClient.patch<T>(url, data, config)
  }

  /**
   * Realiza una petición con la configuración especificada
   * @param {AxiosRequestConfig} config - Configuración para la petición
   * @returns {Promise<AxiosResponse<T>>} La respuesta de la petición
   */
  request<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.apiClient.request<T>(config)
  }
}

/**
 * Servicio HTTP Singleton exportado
 * 
 * @description
 * Este servicio utiliza el patrón Singleton para garantizar una única instancia
 * de la configuración HTTP en toda la aplicación.
 * 
 * @example
 * // Verificar si existe una instancia antes de usarla
 * if (HttpService.hasInstance()) {
 *   console.log('Instancia ya existe')
 * }
 * 
 * @example
 * // Obtener o crear instancia en un componente/controlador
 * const handleLogin = async () => {
 *   try {
 *     // Si ya existe instancia, la reutiliza; si no, la crea
 *     const httpService = await HttpService.getInstance()
 *     
 *     // Configurar token de autenticación
 *     httpService.setBearerToken('mi-token-jwt')
 *     
 *     // Hacer peticiones
 *     const response = await httpService.get('/user/profile')
 *     return response.data
 *   } catch (error) {
 *     console.error('Error:', error)
 *   }
 * }
 * 
 * @example
 * // Uso después del login (instancia ya existe)
 * const fetchUserData = async () => {
 *   const httpService = await HttpService.getInstance() // Reutiliza la instancia existente
 *   const response = await httpService.get('/users')
 *   return response.data
 * }
 * 
 * @example
 * // Reiniciar instancia (útil para cambiar de URL o testing)
 * HttpService.resetInstance()
 * const newHttpService = await HttpService.getInstance() // Crea nueva instancia
 */
export const HttpService = HttpServiceClass
