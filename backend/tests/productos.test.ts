import request from 'supertest';
import app from '../app';

describe('GET /api/productos', () => {
  it('debe responder con estado 200 y una lista de productos', async () => {
    const respuesta = await request(app)
      .get('/api/productos');

    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['content-type']).toMatch(/json/);
    expect(Array.isArray(respuesta.body)).toBe(true);
  });
});