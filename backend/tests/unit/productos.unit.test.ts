
import { Expreso } from '../../models/expreso';
import { Filtrado } from '../../models/filtrado';
import { Pasteleria } from '../../models/pasteleria';
import { Variedad } from '../../models/variedad';

describe('Productos - Cálculo de precios', () => {
  describe('Expreso', () => {
    it('debe calcular el precio de un expreso pocillo con café Brasil', () => {
      const variedad = new Variedad(
        'Brasil',
        140,
        'Acidez baja, cuerpo denso y notas de avellana'
      );

      const producto = new Expreso(
        1,
        'Expreso',
        2500,
        'Pocillo',
        18,
        variedad
      );

      expect(producto.calcularPrecio()).toBe(5020);
    });

    it('debe calcular el precio de un expreso pocillo con café Colombia', () => {
      const variedad = new Variedad(
        'Colombia',
        180,
        'Acidez media, cuerpo equilibrado y notas cítricas y florales'
      );

      const producto = new Expreso(
        2,
        'Expreso',
        2500,
        'Pocillo',
        18,
        variedad
      );

      expect(producto.calcularPrecio()).toBe(5740);
    });

    it('debe calcular el precio de un expreso mediano con café Etiopía', () => {
      const variedad = new Variedad(
        'Etiopía',
        240,
        'Acidez muy viva, cuerpo ligero y notas frutales'
      );

      const producto = new Expreso(
        3,
        'Expreso',
        2500,
        'Mediano',
        27,
        variedad
      );

      expect(producto.calcularPrecio()).toBe(8980);
    });
  });

  describe('Filtrado', () => {
    it('debe calcular el precio de un filtrado pocillo con café Brasil', () => {
      const variedad = new Variedad(
        'Brasil',
        140,
        'Acidez baja, cuerpo denso y notas de avellana'
      );

      const producto = new Filtrado(
        4,
        'Filtrado',
        3200,
        'Pocillo',
        6,
        variedad
      );

      expect(producto.calcularPrecio()).toBe(4040);
    });

    it('debe calcular el precio de un filtrado mediano con café Colombia', () => {
      const variedad = new Variedad(
        'Colombia',
        180,
        'Acidez media, cuerpo equilibrado y notas cítricas y florales'
      );

      const producto = new Filtrado(
        5,
        'Filtrado',
        3200,
        'Mediano',
        15,
        variedad
      );

      expect(producto.calcularPrecio()).toBe(5900);
    });

    it('debe calcular el precio de un filtrado grande con café Etiopía', () => {
      const variedad = new Variedad(
        'Etiopía',
        240,
        'Acidez muy viva, cuerpo ligero y notas frutales'
      );

      const producto = new Filtrado(
        6,
        'Filtrado',
        3200,
        'Taza grande',
        25,
        variedad
      );

      expect(producto.calcularPrecio()).toBe(9200);
    });
  });

  describe('Pastelería', () => {
    it('debe devolver el precio de un muffin de chocolate', () => {
      const producto = new Pasteleria(
        7,
        'Muffin de chocolate',
        2500
      );

      expect(producto.calcularPrecio()).toBe(2500);
    });

    it('debe devolver el precio de una torta selva negra', () => {
      const producto = new Pasteleria(
        8,
        'Torta selva negra',
        4200
      );

      expect(producto.calcularPrecio()).toBe(4200);
    });
  });

  describe('Atributos de los productos', () => {
    it('debe conservar el id, nombre y precio base', () => {
      const producto = new Pasteleria(
        9,
        'Muffin de chocolate',
        2500
      );

      expect(producto.id).toBe(9);
      expect(producto.nombre).toBe('Muffin de chocolate');
      expect(producto.precioBase).toBe(2500);
    });
  });
});