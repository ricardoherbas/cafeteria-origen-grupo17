import conexionDB from '../config/conexion-db';
import { ProductoFactory } from '../factories/producto.factory';
import { Producto } from '../models/producto';

interface ProductoDB {
  id: number;
  nombre: string;
  tipo: 'expreso' | 'filtrado' | 'pasteleria';
  precio_base: string | number;
  gramos: number | null;
  precio_por_gramo: string | number | null;
  tamanio: string | null;
  variedad: string | null;
  acidez: string | null;
  cuerpo: string | null;
  notas: string | null;
}

export class ProductosRepository {
  async findAll(): Promise<Producto[]> {
    const consulta = `
      SELECT
        p.id,
        p.nombre,
        p.tipo,
        p.precio_base,
        p.gramos,
        p.precio_por_gramo,
        t.nombre AS tamanio,
        v.nombre AS variedad,
        v.acidez,
        v.cuerpo,
        v.notas
      FROM productos p
      LEFT JOIN tamanios t ON p.tamanio_id = t.id
      LEFT JOIN variedades v ON p.variedad_id = v.id
      ORDER BY p.id
    `;

    const resultado = await conexionDB.query(consulta);

    return resultado.rows.map((fila: ProductoDB) =>
      ProductoFactory.crear({
        id: fila.id,
        tipo: fila.tipo,
        nombre: fila.nombre,
        precioBase: Number(fila.precio_base),
        ...(fila.tipo !== 'pasteleria' && {
          tamanio: fila.tamanio!,
          gramosCafe: fila.gramos!,
          variedad: {
            nombre: fila.variedad!,
            precioPorGramo: Number(fila.precio_por_gramo),
            descripcion: `Acidez ${fila.acidez}, cuerpo ${fila.cuerpo} y notas ${fila.notas}`,
          },
        }),
      })
    );
  }

  async findById(id: number): Promise<Producto | null> {
    const consulta = `
      SELECT
        p.id,
        p.nombre,
        p.tipo,
        p.precio_base,
        p.gramos,
        p.precio_por_gramo,
        t.nombre AS tamanio,
        v.nombre AS variedad,
        v.acidez,
        v.cuerpo,
        v.notas
      FROM productos p
      LEFT JOIN tamanios t ON p.tamanio_id = t.id
      LEFT JOIN variedades v ON p.variedad_id = v.id
      WHERE p.id = $1
    `;

    const resultado = await conexionDB.query(consulta, [id]);

    if (resultado.rows.length === 0) {
      return null;
    }

    const fila: ProductoDB = resultado.rows[0];

    return ProductoFactory.crear({
      id: fila.id,
      tipo: fila.tipo,
      nombre: fila.nombre,
      precioBase: Number(fila.precio_base),
      ...(fila.tipo !== 'pasteleria' && {
        tamanio: fila.tamanio!,
        gramosCafe: fila.gramos!,
        variedad: {
          nombre: fila.variedad!,
          precioPorGramo: Number(fila.precio_por_gramo),
          descripcion: `Acidez ${fila.acidez}, cuerpo ${fila.cuerpo} y notas ${fila.notas}`,
        },
      }),
    });
  }
}