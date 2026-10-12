import { Producto } from './producto';
import { Variedad } from './variedad';

export class Filtrado extends Producto {
  constructor(
    id: number,
    nombre: string,
    precioBase: number,
    public tamanio: string,
    public gramosCafe: number,
    public variedad: Variedad
  ) {
    super(id, nombre, precioBase);
  }

  calcularPrecio(): number {
    return this.precioBase +
      this.gramosCafe * this.variedad.precioPorGramo;
  }
}
