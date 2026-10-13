import request from "supertest";
import app from "../../app";

// IDs según init.sql: 5 = Expreso Mediano Colombia (2500 + 27 x 180 = 7360), 19 = Muffin (2500)
const EXPRESO_MEDIANO_COLOMBIA = 5;
const MUFFIN = 19;

describe("POST /api/pedidos", () => {
  it("crea un pedido y devuelve el total", async () => {
    const res = await request(app)
      .post("/api/pedidos")
      .send({ items: [{ productoId: EXPRESO_MEDIANO_COLOMBIA, cantidad: 2 }] });

    expect(res.status).toBe(201);
    expect(res.body.estado).toBe("pendiente");
    expect(res.body.total).toBe(14720);
    expect(res.body.items[0]).toMatchObject({
      productoId: EXPRESO_MEDIANO_COLOMBIA,
      cantidad: 2,
      precioUnitario: 7360,
      subtotal: 14720,
    });
  });

  it("acepta una mesa existente", async () => {
    const res = await request(app)
      .post("/api/pedidos")
      .send({ mesaId: 1, items: [{ productoId: MUFFIN, cantidad: 1 }] });

    expect(res.status).toBe(201);
    expect(res.body.mesaId).toBe(1);
  });

  it("responde 400 con items vacío", async () => {
    const res = await request(app).post("/api/pedidos").send({ items: [] });

    expect(res.status).toBe(400);
  });

  it("responde 404 si el producto no existe", async () => {
    const res = await request(app)
      .post("/api/pedidos")
      .send({ items: [{ productoId: 9999, cantidad: 1 }] });

    expect(res.status).toBe(404);
  });
});

describe("GET /api/pedidos", () => {
  it("lista los pedidos creados", async () => {
    await request(app).post("/api/pedidos").send({ items: [{ productoId: MUFFIN, cantidad: 1 }] });

    const res = await request(app).get("/api/pedidos");

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});

describe("GET /api/pedidos/:id", () => {
  it("devuelve el pedido con sus ítems", async () => {
    const creado = await request(app)
      .post("/api/pedidos")
      .send({ items: [{ productoId: MUFFIN, cantidad: 3 }] });

    const res = await request(app).get(`/api/pedidos/${creado.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(7500);
  });

  it("responde 404 si no existe", async () => {
    const res = await request(app).get("/api/pedidos/999999");

    expect(res.status).toBe(404);
  });

  it("responde 400 si el id no es válido", async () => {
    const res = await request(app).get("/api/pedidos/abc");

    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/pedidos/:id/estado", () => {
  it("confirma un pedido pendiente", async () => {
    const creado = await request(app)
      .post("/api/pedidos")
      .send({ items: [{ productoId: MUFFIN, cantidad: 1 }] });

    const res = await request(app)
      .patch(`/api/pedidos/${creado.body.id}/estado`)
      .send({ estado: "confirmado" });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe("confirmado");
  });

  it("responde 409 si la transición no es válida", async () => {
    const creado = await request(app)
      .post("/api/pedidos")
      .send({ items: [{ productoId: MUFFIN, cantidad: 1 }] });
    await request(app).patch(`/api/pedidos/${creado.body.id}/estado`).send({ estado: "cancelado" });

    const res = await request(app)
      .patch(`/api/pedidos/${creado.body.id}/estado`)
      .send({ estado: "pendiente" });

    expect(res.status).toBe(409);
  });

  it("responde 404 si el pedido no existe", async () => {
    const res = await request(app).patch("/api/pedidos/999999/estado").send({ estado: "confirmado" });

    expect(res.status).toBe(404);
  });

  it("responde 400 con un estado inválido", async () => {
    const res = await request(app).patch("/api/pedidos/1/estado").send({ estado: "entregado" });

    expect(res.status).toBe(400);
  });
});
