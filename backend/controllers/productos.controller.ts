import { Request, Response, NextFunction } from 'express';
import { ProductosService } from '../services/productos.service';

export class ProductosController {
  constructor(
    private readonly service: ProductosService
  ) {}

  obtenerTodos = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const productos = await this.service.obtenerTodos();
      res.status(200).json(productos);
    } catch (error) {
      next(error);
    }
  };

  obtenerPorId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
          error: 'El ID del producto debe ser un entero positivo'
        });
        return;
      }

      const producto = await this.service.obtenerPorId(id);

      if (!producto) {
        res.status(404).json({
          error: 'Producto no encontrado'
        });
        return;
      }

      res.status(200).json(producto);
    } catch (error) {
      next(error);
    }
  };
}