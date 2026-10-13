import { ProductosService } from '../../services/productos.service';
import { ProductosRepository } from '../../repositories/productos.repository';
import { Pasteleria } from '../../models/pasteleria';

describe('ProductosService', () => {
  let repository: jest.Mocked<
    Pick<ProductosRepository, 'findAll' | 'findById'>
  >;
  let service: ProductosService;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    service = new ProductosService(repository as ProductosRepository);
  });

  describe('obtenerTodos', () => {
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

  describe('obtenerPorId', () => {
    it('debe devolver el producto encontrado por el repositorio', async () => {
      const producto = new Pasteleria(1, 'Muffin de chocolate', 2500);

      repository.findById.mockResolvedValue(producto);

      await expect(service.obtenerPorId(1)).resolves.toEqual(producto);
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.findById).toHaveBeenCalledTimes(1);
    });

    it('debe devolver null cuando el producto no existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.obtenerPorId(999)).resolves.toBeNull();
      expect(repository.findById).toHaveBeenCalledWith(999);
    });

    it('debe propagar los errores del repositorio al buscar por ID', async () => {
      repository.findById.mockRejectedValue(
        new Error('Error de base de datos')
      );

      await expect(service.obtenerPorId(1)).rejects.toThrow(
        'Error de base de datos'
      );
    });
  });
});
