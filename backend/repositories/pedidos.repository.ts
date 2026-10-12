import conexionDB from "../config/conexion-db";
import { Pedido, NuevoPedido, EstadoPedido } from "../models/pedido";

export interface PedidosRepository {
  crear(datos: NuevoPedido): Promise<Pedido>;
  findAll(): Promise<Pedido[]>;
  findById(id: number): Promise<Pedido | null>;
  actualizarEstado(id: number, estado: EstadoPedido): Promise<void>;
}

// pg devuelve los NUMERIC como string, por eso total, precio_unitario y subtotal son string
interface FilaPedido {
  id: number;
  mesa_id: number | null;
  estado: EstadoPedido;
  total: string;
  producto_id: number | null;
  cantidad: number | null;
  precio_unitario: string | null;
  subtotal: string | null;
}

const SELECT_PEDIDOS = `
  SELECT p.id, p.mesa_id, p.estado, p.total,
         pi.producto_id, pi.cantidad, pi.precio_unitario, pi.subtotal
  FROM pedidos p
  LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
`;

export class PedidosRepositoryPg implements PedidosRepository {
  async crear(datos: NuevoPedido): Promise<Pedido> {
    const client = await conexionDB.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        "INSERT INTO pedidos (mesa_id, total) VALUES ($1, $2) RETURNING id, estado",
        [datos.mesaId ?? null, datos.total]
      );
      for (const item of datos.items) {
        await client.query(
          `INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [rows[0].id, item.productoId, item.cantidad, item.precioUnitario, item.subtotal]
        );
      }
      await client.query("COMMIT");
      return {
        id: rows[0].id,
        estado: rows[0].estado,
        mesaId: datos.mesaId,
        total: datos.total,
        items: datos.items,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findAll(): Promise<Pedido[]> {
    const { rows } = await conexionDB.query<FilaPedido>(`${SELECT_PEDIDOS} ORDER BY p.id, pi.id`);
    return this.agrupar(rows);
  }

  async findById(id: number): Promise<Pedido | null> {
    const { rows } = await conexionDB.query<FilaPedido>(
      `${SELECT_PEDIDOS} WHERE p.id = $1 ORDER BY pi.id`,
      [id]
    );
    return this.agrupar(rows)[0] ?? null;
  }

  async actualizarEstado(id: number, estado: EstadoPedido): Promise<void> {
    await conexionDB.query("UPDATE pedidos SET estado = $1 WHERE id = $2", [estado, id]);
  }

  // Convierte las filas planas del JOIN (una por ítem) en objetos Pedido con sus items adentro
  private agrupar(rows: FilaPedido[]): Pedido[] {
    const porId = new Map<number, Pedido>();
    for (const fila of rows) {
      let pedido = porId.get(fila.id);
      if (!pedido) {
        pedido = {
          id: fila.id,
          mesaId: fila.mesa_id ?? undefined,
          estado: fila.estado,
          total: Number(fila.total),
          items: [],
        };
        porId.set(fila.id, pedido);
      }
      if (fila.producto_id !== null) {
        pedido.items.push({
          productoId: fila.producto_id,
          cantidad: fila.cantidad as number,
          precioUnitario: Number(fila.precio_unitario),
          subtotal: Number(fila.subtotal),
        });
      }
    }
    return Array.from(porId.values());
  }
}
