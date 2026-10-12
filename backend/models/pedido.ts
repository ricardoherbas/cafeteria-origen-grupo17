export interface PedidoItem {
  productoId: number;
  cantidad: number;
}

export type EstadoPedido = "pendiente" | "entregado" | "cancelado";

export interface Pedido {
  id: number;
  items: PedidoItem[];
  estado: EstadoPedido;
}

export type PedidoConTotal = Pedido & { total: number };
