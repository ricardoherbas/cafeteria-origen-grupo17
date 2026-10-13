import { Router } from "express";
import type { ProductosController } from "../controllers/productos.controller";

export function crearProductosRoutes(controller: ProductosController): Router {
  const router = Router();

  router.get("/", controller.obtenerTodos);
  router.get("/:id", controller.obtenerPorId);

  return router;
}