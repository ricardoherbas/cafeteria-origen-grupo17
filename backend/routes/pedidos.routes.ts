import { Router } from "express";
import type { PedidosController } from "../controllers/pedidos.controller";
import {
  validarCrearPedido,
  validarIdPedido,
  validarCambioEstado,
} from "../middlewares/pedidos-validator";

export function crearPedidosRoutes(controller: PedidosController): Router {
  const router = Router();

  router.post("/", validarCrearPedido, controller.crear);
  router.get("/", controller.listar);
  router.get("/:id", validarIdPedido, controller.obtener);
  router.patch("/:id/estado", validarIdPedido, validarCambioEstado, controller.cambiarEstado);

  return router;
}
