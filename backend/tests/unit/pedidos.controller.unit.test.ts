import express from "express";
import request from "supertest";
import { PedidosController } from "../../controllers/pedidos.controller";
import { errorHandler, AppError } from "../../middlewares/error-handler";

const pedidoEjemplo = {
  id: 1,
  estado: "pendiente",
  total: 5000,
  items: [{ productoId: 19, cantidad: 2, precioUnitario: 2500, subtotal: 5000 }],
};

// Arma una app mínima con el controller y un service falso
function crearApp(service: any) {
  const controller = new PedidosController(service);
  const app = express();
  app.use(express.json());
  app.post("/pedidos", controller.crear);
  app.get("/pedidos", controller.listar);
  app.get("/pedidos/:id", controller.obtener);
  app.patch("/pedidos/:id/estado", controller.cambiarEstado);
  app.use(errorHandler);
  return app;
}

describe("PedidosController", () => {
  it("POST /pedidos responde 201 con el pedido creado", async () => {
    const service = { crear: jest.fn().mockResolvedValue(pedidoEjemplo) };
    const body = { items: [{ productoId: 19, cantidad: 2 }] };

    const res = await request(crearApp(service)).post("/pedidos").send(body);

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(5000);
    expect(service.crear).toHaveBeenCalledWith({ mesaId: undefined, items: body.items });
  });

  it("POST /pedidos propaga el 404 del service", async () => {
    const service = { crear: jest.fn().mockRejectedValue(new AppError("Producto 999 no encontrado", 404)) };

    const res = await request(crearApp(service)).post("/pedidos").send({ items: [] });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Producto 999 no encontrado" });
  });

  it("GET /pedidos responde 200 con la lista", async () => {
    const service = { listar: jest.fn().mockResolvedValue([pedidoEjemplo]) };

    const res = await request(crearApp(service)).get("/pedidos");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("GET /pedidos/:id responde 200 con el pedido", async () => {
    const service = { obtener: jest.fn().mockResolvedValue(pedidoEjemplo) };

    const res = await request(crearApp(service)).get("/pedidos/1");

    expect(res.status).toBe(200);
    expect(service.obtener).toHaveBeenCalledWith(1);
  });

  it("GET /pedidos/:id responde 404 si no existe", async () => {
    const service = { obtener: jest.fn().mockRejectedValue(new AppError("Pedido no encontrado", 404)) };

    const res = await request(crearApp(service)).get("/pedidos/999");

    expect(res.status).toBe(404);
  });

  it("PATCH /pedidos/:id/estado responde 200 con el pedido actualizado", async () => {
    const service = {
      cambiarEstado: jest.fn().mockResolvedValue(undefined),
      obtener: jest.fn().mockResolvedValue({ ...pedidoEjemplo, estado: "confirmado" }),
    };

    const res = await request(crearApp(service)).patch("/pedidos/1/estado").send({ estado: "confirmado" });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe("confirmado");
    expect(service.cambiarEstado).toHaveBeenCalledWith(1, "confirmado");
  });

  it("PATCH /pedidos/:id/estado propaga el 409 del service", async () => {
    const service = {
      cambiarEstado: jest.fn().mockRejectedValue(new AppError("No se puede pasar de cancelado a pendiente", 409)),
    };

    const res = await request(crearApp(service)).patch("/pedidos/1/estado").send({ estado: "pendiente" });

    expect(res.status).toBe(409);
  });
});
