import { Request, Response, NextFunction } from 'express';
import { ProductosService } from '../services/productos.service';

export class ProductosController {
  constructor(
    private readonly service: ProductosService
  ) {}

  async obtenerTodos(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const productos = await this.service.obtenerTodos();
      res.status(200).json(productos);
    } catch (error) {
      next(error);
    }
  }
}