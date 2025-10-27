import { IPerson } from '../types/person.interface'

/**
 * Entidad para representar una persona.
 */
export class PersonEntity {
  /**
   * Constructor de la entidad.
   * @param {IPerson} properties - Propiedades de la persona.
   */
  constructor(private readonly properties: IPerson) {}

  /**
   * Propiedades de la persona.
   * @returns {IPerson} - Propiedades de la persona.
   */
  get props(): IPerson {
    return this.properties
  }

  /**
   * Obtiene el nombre completo de la persona.
   * @returns {string} - Nombre completo de la persona.
   */
  getFullName(): string {
    if (!this.properties.firstname && !this.properties.lastname && !this.properties.secondLastname) {
      return ''
    }

    const firstName = `${this.properties.firstname || ''}`.trim()
    const lastName = `${this.properties.lastname || ''}`.trim()
    const secondLastName = `${this.properties.secondLastname || ''}`.trim()
    return `${firstName} ${lastName} ${secondLastName}`.trim()
  }
}
