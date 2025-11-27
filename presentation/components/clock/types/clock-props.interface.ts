/**
 * Propiedades del reloj
 * @interface
 * @property {object} style - Estilos del contenedor
 * @property {object} hourStyle - Estilos del reloj
 * @property {object} dateStyle - Estilos de la fecha
 * @property {object} date - Fecha
 */
export interface IClockProps {
  style?: object
  hourStyle?: object
  dateStyle?: object
  date?: Date
}
