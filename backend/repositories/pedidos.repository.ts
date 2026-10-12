import conexionDB from "../config/conexion-db";
import { Pedido, PedidoItem, EstadoPedido } from "../models/pedido";

export interface PedidosRepository {
  crear(items: PedidoItem[]): Promise<Pedido>;
  findAll(): Promise<Pedido[]>;
  findById(id: number): Promise<Pedido | null>;
  actualizarEstado(id: number, estado: EstadoPedido): Promise<void>;
}

interface FilaPedido {
  id: number;
  estado: EstadoPedido;
  producto_id: number | null;
  cantidad: number | null;
}

export class PedidosRepositoryPg implements PedidosRepository {
  async crear(items: PedidoItem[]): Promise<Pedido> {
    const client = await conexionDB.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        "INSERT INTO pedidos DEFAULT VALUES RETURNING id, estado"
      );
      for (const item of items) {
        await client.query(
          "INSERT INTO pedido_items (pedido_id, producto_id, cantidad) VALUES ($1, $2, $3)",
          [rows[0].id, item.productoId, item.cantidad]
        );
      }
      await client.query("COMMIT");
      return { id: rows[0].id, estado: rows[0].estado, items };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findAll(): Promise<Pedido[]> {
    const { rows } = await conexionDB.query<FilaPedido>(`
      SELECT p.id, p.estado, pi.producto_id, pi.cantidad
      FROM pedidos p
      LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
      ORDER BY p.id, pi.id
    `);
    return this.agrupar(rows);
  }

  async findById(id: number): Promise<Pedido | null> {
    const { rows } = await conexionDB.query<FilaPedido>(
      `SELECT p.id, p.estado, pi.producto_id, pi.cantidad
       FROM pedidos p
       LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
       WHERE p.id = $1
       ORDER BY pi.id`,
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
        pedido = { id: fila.id, estado: fila.estado, items: [] };
        porId.set(fila.id, pedido);
      }
      if (fila.producto_id !== null && fila.cantidad !== null) {
        pedido.items.push({ productoId: fila.producto_id, cantidad: fila.cantidad });
      }
    }
    return Array.from(porId.values());
  }
}
