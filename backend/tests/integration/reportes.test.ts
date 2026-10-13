import request from "supertest";
import app from "../../app";
import conexionDB from "../../config/conexion-db";

beforeEach(async () => {
  await conexionDB.query(
    "TRUNCATE pedido_items, pedidos RESTART IDENTITY CASCADE",
  );
});

describe("GET /api/reportes/facturacion", () => {
  test("con pedidos cargados, suma solo los no cancelados", async () => {
    await conexionDB.query(`
      INSERT INTO pedidos (id, mesa_id, estado, total) VALUES
        (1, 1, 'confirmado', 14240),
        (2, 1, 'pendiente', 4040),
        (3, 1, 'cancelado', 50200)
    `);
    await conexionDB.query(`
      INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
        (1, 1, 2, 5020, 10040),
        (1, 20, 1, 4200, 4200),
        (2, 10, 1, 4040, 4040),
        (3, 1, 10, 5020, 50200)
    `);

    const respuesta = await request(app).get("/api/reportes/facturacion");

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ facturacionTotal: 18280 });
  });

  test("sin pedidos cargados, devuelve facturacionTotal en 0", async () => {
    const respuesta = await request(app).get("/api/reportes/facturacion");

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ facturacionTotal: 0 });
  });
});

describe('GET /api/reportes/mas-vendido', () => {
  test('con pedidos cargados, devuelve el tipo mas vendido', async () => {
    await conexionDB.query(`
      INSERT INTO pedidos (id, mesa_id, estado, total) VALUES
        (1, 1, 'confirmado', 14240),
        (2, 1, 'pendiente', 4040),
        (3, 1, 'cancelado', 50200)
    `);
    await conexionDB.query(`
      INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
        (1, 1, 2, 5020, 10040),
        (1, 20, 1, 4200, 4200),
        (2, 10, 1, 4040, 4040),
        (3, 1, 10, 5020, 50200)
    `);

    const respuesta = await request(app).get('/api/reportes/mas-vendido');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ tipo: 'expreso', cantidad: 2 });
  });
    test('sin pedidos cargados, devuelve 404', async () => {
    const respuesta = await request(app).get('/api/reportes/mas-vendido');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body).toEqual({ error: 'No hay ventas registradas' });
  });
});
