import { AxiosError } from 'axios'
import * as Device from 'expo-device'
import i18next from 'i18next'
import { getOrCreateDeviceToken } from '../../../../../../presentation/utils/token-manager'
import { InvalidFieldFormatException } from '../../../../../shared/domain/exceptions/invalid-field-format.exception'
import { RequiredAllFieldsException } from '../../../../../shared/domain/exceptions/required-all-fields.exception'
import { RequiredFieldException } from '../../../../../shared/domain/exceptions/required-field.exception'
import { ActiveVO } from '../../../../../shared/domain/value-objects/active.vo'
import { EmailVO } from '../../../../../shared/domain/value-objects/email.vo'
import { IntegerIdVO } from '../../../../../shared/domain/value-objects/integer-id.vo'
import { HttpService } from '../../../../../shared/infrastructure/services/http-service'
import { EmployeeEntity } from '../../../../employee/domain/entiities/employee.entity'
import { IEmployee } from '../../../../employee/domain/types/employee.interface'
import { PersonEntity } from '../../../../person/domain/entities/person.entity'
import { IPerson } from '../../../../person/domain/types/person.interface'
import { UserApiDTO } from '../../../../user/domain/entities/user-api.dto'
import { UserEntity } from '../../../../user/domain/entities/user.entity'
import { IUser } from '../../../../user/domain/types/user.interface'
import { AuthenticationEntity } from '../../../domain/entities/authentication-entity'
import { AuthenticationPorts } from '../../../domain/ports/authentication.ports'
import { AuthenticationLocalStorageService } from '../../services/authentication-local-storage.service'

interface LoginResponse {
  status: number
  data: {
    data: {
      token: string
      user: {
        userId: string
        userEmail: string
        userPassword: string
        userPinCode: string
        userActive: boolean
        personId: string
        roleId: string
        pinCodeExpiresAt: string
        businessAccess: boolean
        createdAt: string
        updatedAt: string
        deletedAt: string | null
      }
    }
    message?: string
  }
}

interface SessionResponse {
  status: number
  data: UserApiDTO
}

/**
 * Repositorio que implementa la comunicación con la API para procesos de autenticación
 * @class LoginAPIRepository
 */
export class LoginAPIRepository implements Pick<AuthenticationPorts, 'login'> {
  /**
   * Realiza el proceso de autenticación del usuario contra la API
   * <br />
   * - Se almacena el token de autenticación en el almacenamiento local para futuras solicitudes.
   * @returns {Promise<AuthenticationEntity>} Promesa que resuelve a un objeto Authentication con los datos del usuario y token de sesión
   * @throws { RequiredAllFieldsException } si no se proporcionan las credenciales
   * @throws { RequiredFieldException } si algún campo de las credenciales está vacío
   * @throws { InvalidFieldFormatException } si algún campo de las credenciales tiene formato inválido
   * @throws { Error } si hay problemas de conexión con la API
   */
  async login(authentication: AuthenticationEntity): Promise<AuthenticationEntity> {
    try {
      if (!authentication.props.loginCredentials) {
        throw new RequiredAllFieldsException()
      }

      this.validateCredentials(
        authentication.props.loginCredentials.email,
        authentication.props.loginCredentials.password
      )
      const deviceToken = await getOrCreateDeviceToken()
    
      const response: LoginResponse = await HttpService.post('/auth/login', {
        userEmail: authentication.props.loginCredentials.email,
        userPassword: authentication.props.loginCredentials.password,
        deviceToken,
        deviceModel: Device.modelName,
        deviceBrand: Device.brand,
        deviceType: Device.deviceName,
        deviceOs: `${Device.osName} ${Device.osVersion}`
      })

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      const responseData = response.data.data

      if (!responseData.token) {
        throw new Error(i18next.t('errors.loginFailedNoTokenProvided'))
      }

      HttpService.setBearerToken(responseData.token)

      const sessionUser = await this.getSessionUser()

      const authenticationLocalStorageService = new AuthenticationLocalStorageService()
      const localAuthState = await authenticationLocalStorageService.localGetAuthenticationState()

      const newAuthentication = new AuthenticationEntity({
        authState: {
          user: sessionUser,
          token: responseData.token,
          isAuthenticated: true
        },
        biometricsPreferences: localAuthState?.props.biometricsPreferences,
        loginCredentials: authentication.props.loginCredentials,
        createdAt: new Date()
      })

      if (!newAuthentication?.props?.authState?.isAuthenticated) {
        throw new Error(i18next.t('errors.loginFailedNoAuthenticationStatus'))
      }

      await authenticationLocalStorageService.localStoreAuthenticationCredentials(newAuthentication)
      await authenticationLocalStorageService.localStoreAuthenticationState(newAuthentication)

      return newAuthentication
    } catch (error) {
      console.error(error)
      if (error instanceof AxiosError && error.response) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const errorMessage = (error?.response?.data?.message ||
          i18next.t('errors.loginFailed')) as string
        throw new Error(errorMessage)
      }

      throw new Error(
        error instanceof Error
          ? error.message
          : i18next.t('errors.connectionError')
      )
    }
  }

  /**
   * ==========================================================================================================================
   * Funciones privadas
   * ==========================================================================================================================
   */

  /**
   * Obtiene el usuario de la sesión actual
   * @returns {Promise<UserEntity>} Promesa que resuelve a un objeto User con los datos del usuario
   * @throws { Error } si no se encuentra el usuario con los datos de la sesión
   * @private
   */
  private async getSessionUser(): Promise<UserEntity> {
    const responseUser: SessionResponse = await HttpService.get('/auth/session')

    if (responseUser.status !== 200) {
      throw new Error(i18next.t('errors.loginFailedNoAuthenticationStatus'))
    }

    if (!responseUser.data.person) {
      throw new Error(i18next.t('errors.loginFailedNoAuthenticationStatus'))
    }

    if (!responseUser.data.person.employee) {
      throw new Error(i18next.t('errors.loginFailedNoAuthenticationStatus'))
    }

    const employeeProperties: IEmployee = {
      id: responseUser.data.person.employee.employeeId ? new IntegerIdVO(parseInt(`${responseUser.data.person.employee.employeeId}`)) : null,
      syncId: responseUser.data.person.employee.employeeSyncId,
      code: responseUser.data.person.employee.employeeCode,
      firstName: responseUser.data.person.employee.employeeFirstName,
      lastName: responseUser.data.person.employee.employeeLastName,
      payrollNum: responseUser.data.person.employee.employeePayrollNum,
      hireDate: responseUser.data.person.employee.employeeHireDate,
      companyId: responseUser.data.person.employee.companyId ? new IntegerIdVO(parseInt(`${responseUser.data.person.employee.companyId}`)) : null,
      departmentId: responseUser.data.person.employee.departmentId ? new IntegerIdVO(parseInt(`${responseUser.data.person.employee.departmentId}`)) : null,
      positionId: responseUser.data.person.employee.positionId ? new IntegerIdVO(parseInt(`${responseUser.data.person.employee.positionId}`)) : null,
      departmentSyncId: responseUser.data.person.employee.departmentSyncId,
      positionSyncId: responseUser.data.person.employee.positionSyncId,
      photo: responseUser.data.person.employee.employeePhoto,
      workSchedule: responseUser.data.person.employee.employeeWorkSchedule,
      personId: responseUser.data.person.employee.personId ? new IntegerIdVO(parseInt(`${responseUser.data.person.employee.personId}`)) : null,
      businessUnitId: responseUser.data.person.employee.businessUnitId ? new IntegerIdVO(parseInt(`${responseUser.data.person.employee.businessUnitId}`)) : null,
      payrollBusinessUnitId: responseUser.data.person.employee.payrollBusinessUnitId ? new IntegerIdVO(parseInt(`${responseUser.data.person.employee.payrollBusinessUnitId}`)) : null,
      assistDiscriminator: responseUser.data.person.employee.employeeAssistDiscriminator,
      lastSynchronizationAt: responseUser.data.person.employee.employeeLastSynchronizationAt,
      typeOfContract: responseUser.data.person.employee.employeeTypeOfContract,
      terminatedDate: responseUser.data.person.employee.employeeTerminatedDate,
      typeId: responseUser.data.person.employee.employeeTypeId ? new IntegerIdVO(parseInt(`${responseUser.data.person.employee.employeeTypeId}`)) : null,
      businessEmail: responseUser.data.person.employee.employeeBusinessEmail ? new EmailVO(responseUser.data.person.employee.employeeBusinessEmail) : null,
      ignoreConsecutiveAbsences: responseUser.data.person.employee.employeeIgnoreConsecutiveAbsences,
      createdAt: responseUser.data.person.employee.employeeCreatedAt ? new Date(responseUser.data.person.employee.employeeCreatedAt) : null,
      updatedAt: responseUser.data.person.employee.employeeUpdatedAt ? new Date(responseUser.data.person.employee.employeeUpdatedAt) : null,
      deletedAt: responseUser.data.person.employee.employeeDeletedAt ? new Date(responseUser.data.person.employee.employeeDeletedAt) : null,
      userResponsibleEmployeeChecked: responseUser.data.person.employee.userResponsibleEmployeeChecked ? true : false,
      userResponsibleEmployeeReadonly: responseUser.data.person.employee.userResponsibleEmployeeReadonly ? true : false,
      userResponsibleEmployeeDirectBoss: responseUser.data.person.employee.userResponsibleEmployeeDirectBoss ? true : false
    }

    const employee = new EmployeeEntity(employeeProperties)

    const personProperties: IPerson = {
      id: responseUser.data.person.personId ? new IntegerIdVO(responseUser.data.person.personId) : null,
      firstname: responseUser.data.person.personFirstname,
      lastname: responseUser.data.person.personLastname,
      secondLastname: responseUser.data.person.personSecondLastname,
      phone: responseUser.data.person.personPhone,
      email: responseUser.data.person.personEmail ? new EmailVO(responseUser.data.person.personEmail) : null,
      gender: responseUser.data.person.personGender,
      birthday: responseUser.data.person.personBirthday,
      curp: responseUser.data.person.personCurp,
      rfc: responseUser.data.person.personRfc,
      imssNss: responseUser.data.person.personImssNss,
      phoneSecondary: responseUser.data.person.personPhoneSecondary,
      maritalStatus: responseUser.data.person.personMaritalStatus,
      placeOfBirthCountry: responseUser.data.person.personPlaceOfBirthCountry,
      placeOfBirthState: responseUser.data.person.personPlaceOfBirthState,
      placeOfBirthCity: responseUser.data.person.personPlaceOfBirthCity,
      createdAt: responseUser.data.person.personCreatedAt ? new Date(responseUser.data.person.personCreatedAt) : null,
      updatedAt: responseUser.data.person.personUpdatedAt ? new Date(responseUser.data.person.personUpdatedAt) : null,
      deletedAt: responseUser.data.person.personDeletedAt ? new Date(responseUser.data.person.personDeletedAt) : null,
      employee: employee
    }

    const person = new PersonEntity(personProperties)

    const userProperties: IUser = {
      id: new IntegerIdVO(parseInt(`${responseUser.data.userId}`)),
      email: new EmailVO(responseUser.data.userEmail),
      password: '',
      token: '',
      pinCode: '',
      active: new ActiveVO(responseUser.data.userActive ? 1 : 0),
      personId: responseUser.data.personId ? new IntegerIdVO(parseInt(`${responseUser.data.personId}`)) : null,
      roleId: responseUser.data.roleId ? new IntegerIdVO(parseInt(`${responseUser.data.roleId}`)) : null,
      pinCodeExpiresAt: responseUser.data.pinCodeExpiresAt ? new Date(responseUser.data.pinCodeExpiresAt) : null,
      businessAccess: responseUser.data.businessAccess,
      createdAt: responseUser.data.userCreatedAt ? new Date(responseUser.data.userCreatedAt) : null,
      updatedAt: responseUser.data.userUpdatedAt ? new Date(responseUser.data.userUpdatedAt) : null,
      deletedAt: responseUser.data.deletedAt ? new Date(responseUser.data.deletedAt) : null,
      person: person
    }

    const sessionUser = new UserEntity(userProperties)
    return sessionUser
  }

  /**
   * Valida las credenciales de inicio de sesión del usuario
   * @param {string} email - Correo electrónico del usuario a validar
   * @param {string} password - Contraseña del usuario a validar
   * @throws {RequiredFieldException} si algún campo está vacío
   * @throws {InvalidFieldFormatException} si algún campo tiene formato inválido
   * @private
   */
  private validateCredentials(email: string, password: string): void {
    this.validateEmail(email)
    this.validatePassword(password)
  }

  /**
   * Valida el formato del correo electrónico y verifica posibles patrones de inyección SQL
   * @param {string} email - Correo electrónico a validar
   * @throws {RequiredFieldException} si el correo está vacío
   * @throws {InvalidFieldFormatException} si el correo tiene formato inválido o contiene patrones de inyección SQL
   * @private
   */
  private validateEmail(email: string): void {
    if (!email) {
      throw new RequiredFieldException(
        i18next.t('screens.authentication.email')
      )
    }

    const emailFormatPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailFormatPattern.test(email)) {
      throw new InvalidFieldFormatException(
        i18next.t('screens.authentication.email')
      )
    }

    const emailSqlInjectionPattern = /['"]/

    if (emailSqlInjectionPattern.test(email)) {
      throw new InvalidFieldFormatException(
        i18next.t('screens.authentication.email')
      )
    }
  }

  /**
   * Valida una contraseña contra varios patrones de inyección SQL
   * @param {string} password - Contraseña a validar
   * @throws {RequiredFieldException} si la contraseña está vacía
   * @throws {InvalidFieldFormatException} si la contraseña contiene patrones de inyección SQL
   * @private
   */
  private validatePassword(password: string): void {
    if (!password) {
      throw new RequiredFieldException(
        i18next.t('screens.authentication.password')
      )
    }

    const sqlInjectionPatterns = [
      /\bOR\b\s+['"]?\s*\d+\s*=\s*\d+\s*['"]?/i, // OR 1=1
      /\bAND\b\s+['"]?\s*\d+\s*=\s*\d+\s*['"]?/i, // AND 1=1
      /\bUNION\b\s+\bSELECT\b/i, // UNION SELECT
      /--/, // Comentarios SQL
      /\/\*/, // Comentarios multilínea
      /\s*DROP\s+TABLE/i, // DROP TABLE
      /\s*DELETE\s+FROM/i, // DELETE FROM
      /\s*INSERT\s+INTO/i, // INSERT INTO
      /\s*UPDATE\s+/i, // UPDATE
      /EXEC\s+(\w+)sp_/i, // Stored procedures
      /xp_cmdshell/i, // xp_cmdshell
      /'\s*OR\s*'1'='1/i, // ' OR '1'='1
      /'\s*OR\s*1=1\s*--/i, // ' OR 1=1 --
      /'\s*OR\s*1=1#/i, // ' OR 1=1#
      /'\s*OR\s*1=1\/\*/i, // ' OR 1=1/*
      /'\s*OR\s*''\s*=\s*'/i, // ' OR '' = '
      /'\s*OR\s*''\s*=\s*''\s*--/i, // ' OR '' = '' --
      /'\s*OR\s*""=""/i, // ' OR ""=""
      /'\s*OR\s*TRUE--/i, // ' OR TRUE--
      /'\s*OR\s*'1'='1'\s*--/i, // ' OR '1'='1' --
      /'\s*OR\s*'1'='1'\s*#/i, // ' OR '1'='1' #
      /'\s*OR\s*'1'='1'\/\*/i, // ' OR '1'='1'/*
      /admin'\s*--/i, // admin' --
      /'\s*OR\s*EXISTS\s*\(\s*SELECT/i, // ' OR EXISTS(SELECT * FROM users) --
      /'\s*OR\s*\(\s*SELECT\s*COUNT/i, // ' OR (SELECT COUNT(*) FROM users) > 0 --
      /'\s*OR\s*\(\s*SELECT\s*\w+\s*FROM/i, // ' OR (SELECT username FROM users LIMIT 1) = 'admin
      /'\s*AND\s*1=1\s*--/i, // ' AND 1=1 --
      /'\s*AND\s*1=2\s*--/i, // ' AND 1=2 --
      /'\s*AND\s*substring\s*\(\s*@@version/i, // ' AND substring(@@version,1,1) = '5
      /'\s*AND\s*ascii\s*\(\s*substring/i, // ' AND ascii(substring((SELECT password FROM users LIMIT 1),1,1)) > 64 --
      /'\s*OR\s*IF\s*\(\s*.*SLEEP/i, // ' OR IF(1=1, SLEEP(5), 0) --
      /'\s*OR\s*.*SLEEP\s*\(/i, // ' OR 1=1 AND SLEEP(3) --
      /'\s*OR\s*'a'='a/i, // ' OR 'a'='a
      /password'\s*OR\s*'1'='1/i, // password' OR '1'='1
      /'\s*OR\s*1=1\s*LIMIT\s*1/i, // ' OR 1=1 LIMIT 1 --
      /'\s*OR\s*''\s*=\s*''\s*OR\s*''\s*=\s*'/i, // ' OR '' = '' OR '' = '
      /'\s*OR\s*'1'\s*=\s*'1'\s*\/\*'/i // ' OR '1' = '1' /*'
    ]

    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(password)) {
        throw new InvalidFieldFormatException(
          i18next.t('screens.authentication.password')
        )
      }
    }
  }
}
