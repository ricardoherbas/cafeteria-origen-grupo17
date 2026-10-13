
import { Request, Response, NextFunction } from 'express';
import { ProductosController } from '../../controllers/productos.controller';
import { ProductosService } from '../../services/productos.service';
import { Pasteleria } from '../../models/pasteleria';

describe('ProductosController', () => {
  let service: jest.Mocked<
    Pick<ProductosService, 'obtenerTodos' | 'obtenerPorId'>
  >;
  let controller: ProductosController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    service = {
      obtenerTodos: jest.fn(),
      obtenerPorId: jest.fn(),
    };

    controller = new ProductosController(
      service as unknown as ProductosService
    );

    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe('obtenerTodos', () => {
    it('debe responder con los productos y estado 200', async () => {
      const productos = [
        new Pasteleria(1, 'Muffin de chocolate', 2500),
        new Pasteleria(2, 'Torta selva negra', 4200),
      ];

      service.obtenerTodos.mockResolvedValue(productos);

      await controller.obtenerTodos(
        req as Request,
        res as Response,
        next
      );

      expect(service.obtenerTodos).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(productos);
      expect(next).not.toHaveBeenCalled();
    });

    it('debe responder con una lista vacía cuando no hay productos', async () => {
      service.obtenerTodos.mockResolvedValue([]);

      await controller.obtenerTodos(
        req as Request,
        res as Response,
        next
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('debe delegar los errores al siguiente middleware', async () => {
      const error = new Error('Error de base de datos');

      service.obtenerTodos.mockRejectedValue(error);

      await controller.obtenerTodos(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('obtenerPorId', () => {
    it('debe responder con el producto y estado 200 cuando existe', async () => {
      const producto = new Pasteleria(
        1,
        'Muffin de chocolate',
        2500
      );

      req = {
        params: { id: '1' },
      };

      service.obtenerPorId.mockResolvedValue(producto);

      await controller.obtenerPorId(
        req as Request,
        res as Response,
        next
      );

      expect(service.obtenerPorId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(producto);
      expect(next).not.toHaveBeenCalled();
    });

    it('debe responder con estado 404 cuando el producto no existe', async () => {
      req = {
        params: { id: '99999' },
      };

      service.obtenerPorId.mockResolvedValue(null);

      await controller.obtenerPorId(
        req as Request,
        res as Response,
        next
      );

      expect(service.obtenerPorId).toHaveBeenCalledWith(99999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Producto no encontrado',
      });
    });

    it('debe responder con estado 400 cuando el ID no es válido', async () => {
      req = {
        params: { id: 'abc' },
      };

      await controller.obtenerPorId(
        req as Request,
        res as Response,
        next
      );

      expect(service.obtenerPorId).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El ID del producto debe ser un entero positivo',
      });
    });

    it('debe delegar los errores del servicio al siguiente middleware', async () => {
      const error = new Error('Error al buscar el producto');

      req = {
        params: { id: '1' },
      };

      service.obtenerPorId.mockRejectedValue(error);

      await controller.obtenerPorId(
        req as Request,
        res as Response,
        next
      );

      expect(service.obtenerPorId).toHaveBeenCalledWith(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
