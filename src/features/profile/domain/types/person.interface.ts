import { EmailVO } from '../../../../shared/domain/value-objects/email.vo'
import { IntegerIdVO } from '../../../../shared/domain/value-objects/integer-id.vo'
import { EmployeeEntity } from '../../../employee/domain/entiities/employee.entity'

/**
 * Interfaz que define una persona.
 * @interface IPerson
 * @property {IntegerIdVO | null} id - El ID de la persona.
 * @property {string} firstname - El nombre de la persona.
 * @property {string} lastname - El apellido de la persona.
 * @property {string} secondLastname - El segundo apellido de la persona.
 * @property {string | null} phone - El teléfono de la persona.
 * @property {EmailVO | null} email - El correo electrónico de la persona.
 * @property {string | null} gender - El género de la persona.
 * @property {Date | string | null} birthday - La fecha de nacimiento de la persona.
 * @property {string | null} curp - El CURP de la persona.
 * @property {string | null} rfc - El RFC de la persona.
 * @property {string | null} imssNss - El NSS de la persona.
 * @property {string | null} phoneSecondary - El teléfono secundario de la persona.
 * @property {string | null} maritalStatus - El estado civil de la persona.
 * @property {string | null} placeOfBirthCountry - El país de nacimiento de la persona.
 * @property {string | null} placeOfBirthState - El estado de nacimiento de la persona.
 * @property {string | null} placeOfBirthCity - La ciudad de nacimiento de la persona.
 * @property {Date | string | null} createdAt - La fecha de creación de la persona.
 * @property {Date | string | null} updatedAt - La fecha de actualización de la persona.
 * @property {Date | string | null} deletedAt - La fecha de eliminación de la persona.
 * @property {EmployeeEntity | undefined} employee - El empleado asociado a la persona.
 */
export interface IPerson {
  readonly id: IntegerIdVO | null
  readonly firstname: string
  readonly lastname: string
  readonly secondLastname: string
  readonly phone: string | null
  readonly email: EmailVO | null
  readonly gender: string | null
  readonly birthday: Date | string | null
  readonly curp: string | null
  readonly rfc: string | null
  readonly imssNss: string | null
  readonly phoneSecondary: string | null
  readonly maritalStatus: string | null
  readonly placeOfBirthCountry: string | null
  readonly placeOfBirthState: string | null
  readonly placeOfBirthCity: string | null
  readonly createdAt: Date | string | null
  readonly updatedAt: Date | string | null
  readonly deletedAt: Date | string | null

  readonly employee?: EmployeeEntity
}
