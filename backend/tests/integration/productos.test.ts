import request from 'supertest';
import app from '../../app';

describe('GET /api/productos', () => {
  it('debe responder con estado 200 y una lista de productos', async () => {
    const respuesta = await request(app)
      .get('/api/productos');

    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['content-type']).toMatch(/json/);
    expect(Array.isArray(respuesta.body)).toBe(true);
  });
});

describe('GET /api/productos/:id', () => {
  it('debe responder con estado 200 al buscar un producto existente', async () => {
    const respuesta = await request(app)
      .get('/api/productos/1');

    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['content-type']).toMatch(/json/);
    expect(respuesta.body).toHaveProperty('id', 1);
  });

  it('debe responder con estado 404 si el producto no existe', async () => {
    const respuesta = await request(app)
      .get('/api/productos/99999');

    expect(respuesta.status).toBe(404);
  });

  it('debe responder con estado 400 si el ID no es válido', async () => {
    const respuesta = await request(app)
      .get('/api/productos/abc');

    expect(respuesta.status).toBe(400);
  });
});
