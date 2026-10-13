import express from "express";
import request from "supertest";
import { PedidosController } from "../../controllers/pedidos.controller";
import { crearPedidosRoutes } from "../../routes/pedidos.routes";
import { errorHandler } from "../../middlewares/error-handler";

const pedidoEjemplo = {
  id: 1,
  estado: "pendiente",
  total: 5000,
  items: [{ productoId: 19, cantidad: 2, precioUnitario: 2500, subtotal: 5000 }],
};

// App mínima: routes reales + controller real + service falso
function crearApp() {
  const service = {
    crear: jest.fn().mockResolvedValue(pedidoEjemplo),
    listar: jest.fn().mockResolvedValue([pedidoEjemplo]),
    obtener: jest.fn().mockResolvedValue(pedidoEjemplo),
    cambiarEstado: jest.fn().mockResolvedValue(undefined),
  };
  const app = express();
  app.use(express.json());
  app.use("/pedidos", crearPedidosRoutes(new PedidosController(service as any)));
  app.use(errorHandler);
  return { app, service };
}

describe("rutas de pedidos", () => {
  it("POST /pedidos válido llega al controller y responde 201", async () => {
    const { app, service } = crearApp();

    const res = await request(app).post("/pedidos").send({ items: [{ productoId: 19, cantidad: 2 }] });

    expect(res.status).toBe(201);
    expect(service.crear).toHaveBeenCalledTimes(1);
  });

  it("POST /pedidos con items vacío responde 400 sin llamar al service", async () => {
    const { app, service } = crearApp();

    const res = await request(app).post("/pedidos").send({ items: [] });

    expect(res.status).toBe(400);
    expect(service.crear).not.toHaveBeenCalled();
  });

  it("GET /pedidos responde 200 con la lista", async () => {
    const { app } = crearApp();

    const res = await request(app).get("/pedidos");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("GET /pedidos/:id válido responde 200", async () => {
    const { app, service } = crearApp();

    const res = await request(app).get("/pedidos/1");

    expect(res.status).toBe(200);
    expect(service.obtener).toHaveBeenCalledWith(1);
  });

  it("GET /pedidos/abc responde 400 sin llamar al service", async () => {
    const { app, service } = crearApp();

    const res = await request(app).get("/pedidos/abc");

    expect(res.status).toBe(400);
    expect(service.obtener).not.toHaveBeenCalled();
  });

  it("PATCH /pedidos/:id/estado válido responde 200", async () => {
    const { app, service } = crearApp();

    const res = await request(app).patch("/pedidos/1/estado").send({ estado: "confirmado" });

    expect(res.status).toBe(200);
    expect(service.cambiarEstado).toHaveBeenCalledWith(1, "confirmado");
  });

  it("PATCH /pedidos/:id/estado con estado inválido responde 400 sin llamar al service", async () => {
    const { app, service } = crearApp();

    const res = await request(app).patch("/pedidos/1/estado").send({ estado: "entregado" });

    expect(res.status).toBe(400);
    expect(service.cambiarEstado).not.toHaveBeenCalled();
  });

  it("PATCH /pedidos/0/estado responde 400 por id inválido", async () => {
    const { app, service } = crearApp();

    const res = await request(app).patch("/pedidos/0/estado").send({ estado: "confirmado" });

    expect(res.status).toBe(400);
    expect(service.cambiarEstado).not.toHaveBeenCalled();
  });
});
