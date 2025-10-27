import { EmployeeApiDTO } from '../../../employee/domain/entiities/employee-api.dto'

/**
 * Interfaz que define un usuario API.
 * @interface PersonApiDTO
 * @property {number | null} personId - El ID de la persona.
 * @property {string} personFirstname - El nombre de la persona.
 * @property {string} personLastname - El apellido de la persona.
 * @property {string} personSecondLastname - El segundo apellido de la persona.
 * @property {string | null} personPhone - El teléfono de la persona.
 * @property {string | null} personEmail - El correo electrónico de la persona.
 * @property {string | null} personGender - El género de la persona.
 * @property {Date | string | null} personBirthday - La fecha de nacimiento de la persona.
 * @property {string | null} personCurp - El CURP de la persona.
 * @property {string | null} personRfc - El RFC de la persona.
 * @property {string | null} personImssNss - El NSS de la persona.
 * @property {string | null} personPhoneSecondary - El teléfono secundario de la persona.
 * @property {string | null} personMaritalStatus - El estado civil de la persona.
 * @property {string | null} personPlaceOfBirthCountry - El país de nacimiento de la persona.
 * @property {string | null} personPlaceOfBirthState - El estado de nacimiento de la persona.
 * @property {string | null} personPlaceOfBirthCity - La ciudad de nacimiento de la persona.
 * @property {Date | string | null} personCreatedAt - La fecha de creación de la persona.
 * @property {Date | string | null} personUpdatedAt - La fecha de actualización de la persona.
 * @property {Date | string | null} personDeletedAt - La fecha de eliminación de la persona.
 * @property {EmployeeApiDTO | undefined} employee - El empleado de la persona.
 */
export interface PersonApiDTO {
  personId: number | null
  personFirstname: string
  personLastname: string
  personSecondLastname: string
  personPhone: string | null
  personEmail: string | null
  personGender: string | null
  personBirthday: Date | string | null
  personCurp: string | null
  personRfc: string | null
  personImssNss: string | null
  personPhoneSecondary: string | null
  personMaritalStatus: string | null
  personPlaceOfBirthCountry: string | null
  personPlaceOfBirthState: string | null
  personPlaceOfBirthCity: string | null
  personCreatedAt: Date | string | null
  personUpdatedAt: Date | string | null
  personDeletedAt: Date | string | null

  employee?: EmployeeApiDTO
}
