/**
 * Interfaz que define un empleado API.
 * @interface EmployeeApiDTO
 * @property {number | null} employeeId - El ID del empleado.
 * @property {string} employeeSyncId - El ID de sincronización del empleado.
 * @property {string} employeeCode - El código del empleado.
 * @property {string} employeeFirstName - El nombre del empleado.
 * @property {string} employeeLastName - El apellido del empleado.
 * @property {string | null} employeePayrollNum - El número de nómina del empleado.
 * @property {Date | null} employeeHireDate - La fecha de contratación del empleado.
 * @property {number | null} companyId - El ID de la empresa del empleado.
 * @property {number | null} departmentId - El ID del departamento del empleado.
 * @property {number | null} positionId - El ID de la posición del empleado.
 * @property {string} departmentSyncId - El ID de sincronización del departamento del empleado.
 * @property {string} positionSyncId - El ID de sincronización de la posición del empleado.
 * @property {string | null} employeePhoto - La foto del empleado.
 * @property {string | null} employeeWorkSchedule - El horario de trabajo del empleado.
 * @property {number | null} personId - El ID de la persona del empleado.
 * @property {number | null} businessUnitId - El ID de la unidad de negocio del empleado.
 * @property {number | null} payrollBusinessUnitId - El ID de la unidad de negocio de nómina del empleado.
 * @property {number} employeeAssistDiscriminator - El discriminador de asistencia del empleado.
 * @property {Date | null} employeeLastSynchronizationAt - La fecha de última sincronización del empleado.
 * @property {string | null} employeeTypeOfContract - El tipo de contrato del empleado.
 * @property {Date | null} employeeTerminatedDate - La fecha de terminación del empleado.
 * @property {number} employeeTypeId - El ID del tipo de empleado.
 * @property {string | null} employeeBusinessEmail - El correo electrónico del empleado.
 * @property {number} employeeIgnoreConsecutiveAbsences - El número de ausencias consecutivas ignoradas.
 * @property {Date | null} employeeCreatedAt - La fecha de creación del empleado.
 * @property {Date | null} employeeUpdatedAt - La fecha de actualización del empleado.
 * @property {Date | null} employeeDeletedAt - La fecha de eliminación del empleado.
 * @property {Date | null} deletedAt - La fecha de eliminación del empleado.
 * @property {boolean | undefined} userResponsibleEmployeeChecked - Indica si el usuario es responsable del empleado.
 * @property {boolean | undefined} userResponsibleEmployeeReadonly - Indica si el usuario es responsable del empleado.
 * @property {boolean | undefined} userResponsibleEmployeeDirectBoss - Indica si el usuario es responsable del empleado.
 */
export interface EmployeeApiDTO {
  employeeId: number | null
  employeeSyncId: string
  employeeCode: string
  employeeFirstName: string
  employeeLastName: string
  employeePayrollNum: string | null
  employeeHireDate: Date | null
  companyId: number
  departmentId: number
  positionId: number
  departmentSyncId: string
  positionSyncId: string
  employeePhoto: string | null
  employeeWorkSchedule: string | null
  personId: number
  businessUnitId: number
  payrollBusinessUnitId: number | null
  employeeAssistDiscriminator: number
  employeeLastSynchronizationAt: Date | null
  employeeTypeOfContract: string | null
  employeeTerminatedDate: Date | null
  employeeTypeId: number
  employeeBusinessEmail: string | null
  employeeIgnoreConsecutiveAbsences: number
  employeeAuthorizeAnyZones: number
  employeeCreatedAt: Date | null
  employeeUpdatedAt: Date | null
  employeeDeletedAt: Date | null
  deletedAt: Date | null
  userResponsibleEmployeeChecked?: boolean
  userResponsibleEmployeeReadonly?: boolean
  userResponsibleEmployeeDirectBoss: boolean
}
