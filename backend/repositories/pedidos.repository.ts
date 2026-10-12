import { Pedido, PedidoItem, EstadoPedido } from "../models/pedido";

export interface PedidosRepository {
  crear(items: PedidoItem[]): Promise<Pedido>;
  findAll(): Promise<Pedido[]>;
  findById(id: number): Promise<Pedido | null>;
  actualizarEstado(id: number, estado: EstadoPedido): Promise<void>;
}
