import { Router } from 'express';
import { ProductosRepository } from '../repositories/productos.repository';
import { ProductosService } from '../services/productos.service';
import { ProductosController } from '../controllers/productos.controller';

const router = Router();

const repository = new ProductosRepository();
const service = new ProductosService(repository);
const controller = new ProductosController(service);

router.get('/', (req, res, next) => {
  void controller.obtenerTodos(req, res, next);
});

router.get('/:id', (req, res, next) => {
  void controller.obtenerPorId(req, res, next);
});

export default router;
