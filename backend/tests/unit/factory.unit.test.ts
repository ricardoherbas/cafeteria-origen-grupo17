import { ProductoFactory } from '../../factories/producto.factory';
import { Expreso } from '../../models/expreso';
import { Filtrado } from '../../models/filtrado';
import { Pasteleria } from '../../models/pasteleria';

describe('ProductoFactory', () => {
  it('debe crear un producto de tipo expreso', () => {
    const producto = ProductoFactory.crear({
      id: 1,
      tipo: 'expreso',
      nombre: 'Expreso',
      precioBase: 2500,
      tamanio: 'Pocillo',
      gramosCafe: 18,
      variedad: {
        nombre: 'Brasil',
        precioPorGramo: 140,
        descripcion: 'Acidez baja, cuerpo denso y notas de avellana',
      },
    });

    expect(producto).toBeInstanceOf(Expreso);
    expect(producto.calcularPrecio()).toBe(5020);
  });

  it('debe crear un producto de tipo filtrado', () => {
    const producto = ProductoFactory.crear({
      id: 2,
      tipo: 'filtrado',
      nombre: 'Filtrado',
      precioBase: 3200,
      tamanio: 'Pocillo',
      gramosCafe: 6,
      variedad: {
        nombre: 'Brasil',
        precioPorGramo: 140,
        descripcion: 'Acidez baja, cuerpo denso y notas de avellana',
      },
    });

    expect(producto).toBeInstanceOf(Filtrado);
    expect(producto.calcularPrecio()).toBe(4040);
  });

  it('debe crear un producto de tipo pasteleria', () => {
    const producto = ProductoFactory.crear({
      id: 3,
      tipo: 'pasteleria',
      nombre: 'Torta selva negra',
      precioBase: 4200,
    });

    expect(producto).toBeInstanceOf(Pasteleria);
    expect(producto.calcularPrecio()).toBe(4200);
  });
});