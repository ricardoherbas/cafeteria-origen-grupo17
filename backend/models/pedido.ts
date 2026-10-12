export type EstadoPedido = "pendiente" | "confirmado" | "cancelado";

// Lo que manda el cliente en POST /pedidos
export interface PedidoItem {
  productoId: number;
  cantidad: number;
}

// Lo que se guarda: el precio queda congelado al momento del pedido
export interface PedidoItemGuardado extends PedidoItem {
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  mesaId?: number;
  estado: EstadoPedido;
  total: number;
  items: PedidoItemGuardado[];
}

// Lo que el service le pasa al repository (ya calculado)
export interface NuevoPedido {
  mesaId?: number;
  total: number;
  items: PedidoItemGuardado[];
}
