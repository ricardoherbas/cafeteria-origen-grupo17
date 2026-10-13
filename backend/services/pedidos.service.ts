import type { PedidosRepository } from "../repositories/pedidos.repository";
import type { Pedido, PedidoItem, EstadoPedido } from "../models/pedido";
import { AppError } from "../middlewares/error-handler";
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

const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  pendiente: ["confirmado", "cancelado"],
  confirmado: [],
  cancelado: [],
};

export class PedidosService {
  constructor(
    private pedidosRepo: PedidosRepository,
    private productosRepo: ProductosLectura
  ) { }

  async crear(datos: DatosPedido): Promise<Pedido> {
    const productos = await this.productosRepo.findAll();
    const precios = new Map<number, number>(
      productos.map((p): [number, number] => [p.id, p.calcularPrecio()])
    );

    const items = datos.items.map((item) => {
      const precioUnitario = precios.get(item.productoId);
      if (precioUnitario === undefined) {
        throw new AppError(`Producto ${item.productoId} no encontrado`, 404);
      }
      return { ...item, precioUnitario, subtotal: precioUnitario * item.cantidad };
    });
    const total = items.reduce((acc, item) => acc + item.subtotal, 0);

    return this.pedidosRepo.crear({ mesaId: datos.mesaId, total, items });
  }

  async listar(): Promise<Pedido[]> {
    return this.pedidosRepo.findAll();
  }

  async obtener(id: number): Promise<Pedido> {
    const pedido = await this.pedidosRepo.findById(id);
    if (!pedido) throw new AppError("Pedido no encontrado", 404);
    return pedido;
  }

  async cambiarEstado(id: number, nuevo: EstadoPedido): Promise<void> {
    const pedido = await this.obtener(id);
    if (!TRANSICIONES[pedido.estado].includes(nuevo)) {
      throw new AppError(`No se puede pasar de ${pedido.estado} a ${nuevo}`, 409);
    }
    await this.pedidosRepo.actualizarEstado(id, nuevo);
  }
}

