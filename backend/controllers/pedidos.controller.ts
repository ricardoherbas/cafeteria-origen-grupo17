import type { Request, Response, NextFunction } from "express";
import type { PedidosService } from "../services/pedidos.service";
import type { EstadoPedido } from "../models/pedido";

type ServicioPedidos = Pick<PedidosService, "crear" | "listar" | "obtener" | "cambiarEstado">;

export class PedidosController {
  constructor(private service: ServicioPedidos) {}

  // Arrow functions: así `this` sigue apuntando al controller cuando Express las llama
  crear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { mesaId, items } = req.body;
      const pedido = await this.service.crear({ mesaId, items });
      res.status(201).json(pedido);
    } catch (error) {
      next(error); // Express 4 no captura solo los errores de handlers async
    }
  };

  listar = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(await this.service.listar());
    } catch (error) {
      next(error);
    }
  };

  obtener = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(await this.service.obtener(Number(req.params.id)));
    } catch (error) {
      next(error);
    }
  };

  cambiarEstado = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await this.service.cambiarEstado(id, req.body.estado as EstadoPedido);
      res.status(200).json(await this.service.obtener(id));
    } catch (error) {
      next(error);
    }
  };
}
