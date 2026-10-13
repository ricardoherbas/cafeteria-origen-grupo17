import type { PedidosRepository } from "../../repositories/pedidos.repository";
import type { Pedido, NuevoPedido, EstadoPedido } from "../../models/pedido";
import { PedidosService } from "../../services/pedidos.service";

// Repository en memoria: reemplaza a la base en los tests unitarios
class PedidosRepoMemoria implements PedidosRepository {
  private pedidos: Pedido[] = [];

  async crear(datos: NuevoPedido): Promise<Pedido> {
    const pedido: Pedido = { id: this.pedidos.length + 1, estado: "pendiente", ...datos };
    this.pedidos.push(pedido);
    return pedido;
  }
  async findAll(): Promise<Pedido[]> {
    return this.pedidos;
  }
  async findById(id: number): Promise<Pedido | null> {
    return this.pedidos.find((p) => p.id === id) ?? null;
  }
  async actualizarEstado(id: number, estado: EstadoPedido): Promise<void> {
    const pedido = this.pedidos.find((p) => p.id === id);
    if (pedido) pedido.estado = estado;
  }
}

// Catálogo falso, con los precios finales de la tabla del TP
const catalogo = [
  { id: 5, calcularPrecio: () => 7360 }, // Expreso Mediano Colombia
  { id: 19, calcularPrecio: () => 2500 }, // Muffin de chocolate
];
const productosRepo = { findAll: async () => catalogo };

describe("PedidosService.crear", () => {
  it("calcula precioUnitario, subtotal y total: 2 x 7360 + 1 x 2500 = 17220", async () => {
    const service = new PedidosService(new PedidosRepoMemoria(), productosRepo);

    const pedido = await service.crear({
      items: [
        { productoId: 5, cantidad: 2 },
        { productoId: 19, cantidad: 1 },
      ],
    });

    expect(pedido.total).toBe(17220);
    expect(pedido.estado).toBe("pendiente");
    expect(pedido.items[0]).toMatchObject({ productoId: 5, precioUnitario: 7360, subtotal: 14720 });
    expect(pedido.items[1]).toMatchObject({ productoId: 19, precioUnitario: 2500, subtotal: 2500 });
  });
});

describe("PedidosService.cambiarEstado - transiciones válidas", () => {
  it.each(["confirmado", "cancelado"] as const)("pendiente -> %s", async (nuevo) => {
    const repo = new PedidosRepoMemoria();
    const service = new PedidosService(repo, productosRepo);
    const pedido = await service.crear({ items: [{ productoId: 5, cantidad: 1 }] });

    await service.cambiarEstado(pedido.id, nuevo);

    expect((await repo.findById(pedido.id))?.estado).toBe(nuevo);
  });
});

describe("PedidosService.crear - producto inexistente", () => {
  it("lanza 404 y no guarda el pedido", async () => {
    const repo = new PedidosRepoMemoria();
    const service = new PedidosService(repo, productosRepo);

    await expect(
      service.crear({
        items: [
          { productoId: 5, cantidad: 1 },
          { productoId: 999, cantidad: 1 },
        ],
      })
    ).rejects.toMatchObject({ status: 404 });

    expect(await repo.findAll()).toHaveLength(0);
  });
});

describe("PedidosService.cambiarEstado - reglas", () => {
  it("lanza 404 si el pedido no existe", async () => {
    const service = new PedidosService(new PedidosRepoMemoria(), productosRepo);

    await expect(service.cambiarEstado(999, "confirmado")).rejects.toMatchObject({ status: 404 });
  });

  it.each([
    ["confirmado", "cancelado"],
    ["confirmado", "pendiente"],
    ["cancelado", "pendiente"],
    ["cancelado", "confirmado"],
  ] as const)("%s -> %s lanza 409", async (desde, hacia) => {
    const repo = new PedidosRepoMemoria();
    const service = new PedidosService(repo, productosRepo);
    const pedido = await service.crear({ items: [{ productoId: 5, cantidad: 1 }] });
    await repo.actualizarEstado(pedido.id, desde);

    await expect(service.cambiarEstado(pedido.id, hacia)).rejects.toMatchObject({ status: 409 });
    expect((await repo.findById(pedido.id))?.estado).toBe(desde);
  });
});

describe("PedidosService - consultas", () => {
  it("listar devuelve todos los pedidos", async () => {
    const repo = new PedidosRepoMemoria();
    const service = new PedidosService(repo, productosRepo);
    await service.crear({ items: [{ productoId: 5, cantidad: 1 }] });
    await service.crear({ items: [{ productoId: 19, cantidad: 2 }] });

    const pedidos = await service.listar();

    expect(pedidos).toHaveLength(2);
  });

  it("obtener devuelve el pedido con su total", async () => {
    const service = new PedidosService(new PedidosRepoMemoria(), productosRepo);
    const creado = await service.crear({ items: [{ productoId: 19, cantidad: 2 }] });

    const pedido = await service.obtener(creado.id);

    expect(pedido.id).toBe(creado.id);
    expect(pedido.total).toBe(5000);
  });

  it("obtener lanza 404 si el pedido no existe", async () => {
    const service = new PedidosService(new PedidosRepoMemoria(), productosRepo);

    await expect(service.obtener(999)).rejects.toMatchObject({ status: 404 });
  });
});
