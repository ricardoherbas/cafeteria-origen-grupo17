import { ProductosRepository } from '../repositories/productos.repository';
import { Producto } from '../models/producto';

export class ProductosService {
  constructor(
    private readonly repository: ProductosRepository
  ) {}

  async obtenerTodos(): Promise<Producto[]> {
    return this.repository.findAll();
  }

  async obtenerPorId(id: number): Promise<Producto | null> {
    return this.repository.findById(id);
  }
}
