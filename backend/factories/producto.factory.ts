import { Expreso } from '../models/expreso';
import { Filtrado } from '../models/filtrado';
import { Pasteleria } from '../models/pasteleria';
import { Variedad } from '../models/variedad';
import { Producto } from '../models/producto';

interface DatosProducto {
  id: number;
  tipo: 'expreso' | 'filtrado' | 'pasteleria';
  nombre: string;
  precioBase: number;
  tamanio?: string;
  gramosCafe?: number;
  variedad?: {
    nombre: string;
    precioPorGramo: number;
    descripcion: string;
  };
}

export class ProductoFactory {
  static crear(datos: DatosProducto): Producto {
    switch (datos.tipo) {
      case 'expreso':
      case 'filtrado': {
        if (
          !datos.tamanio ||
          datos.gramosCafe === undefined ||
          !datos.variedad
        ) {
          throw new Error(
            `Faltan datos para crear un producto de tipo ${datos.tipo}`
          );
        }

        const variedad = new Variedad(
          datos.variedad.nombre,
          datos.variedad.precioPorGramo,
          datos.variedad.descripcion
        );

        if (datos.tipo === 'expreso') {
          return new Expreso(
            datos.id,
            datos.nombre,
            datos.precioBase,
            datos.tamanio,
            datos.gramosCafe,
            variedad
          );
        }

        return new Filtrado(
          datos.id,
          datos.nombre,
          datos.precioBase,
          datos.tamanio,
          datos.gramosCafe,
          variedad
        );
      }

      case 'pasteleria':
        return new Pasteleria(
          datos.id,
          datos.nombre,
          datos.precioBase
        );

      default: {
        const tipo: never = datos.tipo;
        throw new Error(`Tipo de producto no válido: ${tipo}`);
      }
    }
  }
}