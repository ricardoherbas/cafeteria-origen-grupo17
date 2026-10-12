import { ProductosService } from '../../services/productos.service';
import { ProductosRepository } from '../../repositories/productos.repository';
import { Pasteleria } from '../../models/pasteleria';

describe('ProductosService', () => {
  let repository: jest.Mocked<Pick<ProductosRepository, 'findAll'>>;
  let service: ProductosService;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(),
    };

    service = new ProductosService(repository as ProductosRepository);
  });

  it('debe devolver todos los productos del repositorio', async () => {
    const productos = [
      new Pasteleria(1, 'Muffin de chocolate', 2500),
      new Pasteleria(2, 'Torta selva negra', 4200),
    ];

    repository.findAll.mockResolvedValue(productos);

    await expect(service.obtenerTodos()).resolves.toEqual(productos);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it('debe devolver una lista vacía cuando no hay productos', async () => {
    repository.findAll.mockResolvedValue([]);

    await expect(service.obtenerTodos()).resolves.toEqual([]);
  });

  it('debe propagar los errores del repositorio', async () => {
    repository.findAll.mockRejectedValue(
      new Error('Error de base de datos')
    );

    await expect(service.obtenerTodos()).rejects.toThrow(
      'Error de base de datos'
    );
  });
});