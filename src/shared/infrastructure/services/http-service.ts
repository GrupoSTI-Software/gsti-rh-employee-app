import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
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
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: 'application/json'
      }
    })
  }

  /**
   * Obtiene la instancia única de HttpServiceClass (Singleton)
   * @returns {HttpServiceClass} La instancia única de HttpServiceClass
   */
  public static async getInstance(): Promise<HttpServiceClass> {
    if (!HttpServiceClass.instance) {
      const apiUrl = await getApi()
      HttpServiceClass.instance = new HttpServiceClass(apiUrl ? apiUrl : '')
    }
    return HttpServiceClass.instance
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

 
export const HttpService = HttpServiceClass.getInstance()
