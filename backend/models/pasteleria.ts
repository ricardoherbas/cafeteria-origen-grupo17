import { Producto } from './producto';

export class Pasteleria extends Producto {
  calcularPrecio(): number {
    return this.precioBase;
  }
}