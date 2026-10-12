import type { PedidosRepository } from "../repositories/pedidos.repository";
import type { Pedido, PedidoItem, EstadoPedido } from "../models/pedido";
// Lo único que el service necesita de un producto. La clase Producto de A lo cumple sola.
export interface ProductoConPrecio {
  id: number;
  calcularPrecio(): number;
}

export interface ProductosLectura {
  findAll(): Promise<ProductoConPrecio[]>;
}

// Lo que llega del controller en POST /pedidos
export interface DatosPedido {
  mesaId?: number;
  items: PedidoItem[];
}

export class PedidosService {
  constructor(
    private pedidosRepo: PedidosRepository,
    private productosRepo: ProductosLectura
  ) {}

  async crear(datos: DatosPedido): Promise<Pedido> {
    const productos = await this.productosRepo.findAll();
    const precios = new Map<number, number>(
      productos.map((p): [number, number] => [p.id, p.calcularPrecio()])
    );

    const items = datos.items.map((item) => {
      const precioUnitario = precios.get(item.productoId) ?? 0;
      return { ...item, precioUnitario, subtotal: precioUnitario * item.cantidad };
    });
    const total = items.reduce((acc, item) => acc + item.subtotal, 0);

    return this.pedidosRepo.crear({ mesaId: datos.mesaId, total, items });
  }

    async cambiarEstado(id: number, nuevo: EstadoPedido): Promise<void> {
    await this.pedidosRepo.actualizarEstado(id, nuevo);
  }
}

