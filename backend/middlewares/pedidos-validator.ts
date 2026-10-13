import type { Request, Response, NextFunction } from "express";
import type { EstadoPedido } from "../models/pedido";

const ESTADOS: EstadoPedido[] = ["pendiente", "confirmado", "cancelado"];

const esEnteroPositivo = (valor: unknown): valor is number =>
  typeof valor === "number" && Number.isInteger(valor) && valor > 0;

const rechazar = (res: Response, mensaje: string): void => {
  res.status(400).json({ error: mensaje });
};

export function validarCrearPedido(req: Request, res: Response, next: NextFunction): void {
  const { mesaId, items } = req.body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    return rechazar(res, "items debe ser un array no vacío");
  }

  for (const item of items) {
    if (typeof item !== "object" || item === null) {
      return rechazar(res, "cada ítem debe ser un objeto");
    }
    if (!esEnteroPositivo(item.productoId)) {
      return rechazar(res, "productoId debe ser un entero mayor que 0");
    }
    if (!esEnteroPositivo(item.cantidad)) {
      return rechazar(res, "cantidad debe ser un entero mayor que 0");
    }
  }

  // La mesa es opcional: solo se valida si viene
  if (mesaId !== undefined && mesaId !== null && !esEnteroPositivo(mesaId)) {
    return rechazar(res, "mesaId debe ser un entero mayor que 0");
  }

  next();
}

export function validarIdPedido(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;

  // Regex y no Number(): así "1.5", "12abc" o "" no se cuelan
  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    return rechazar(res, "El id del pedido debe ser un entero mayor que 0");
  }

  next();
}

export function validarCambioEstado(req: Request, res: Response, next: NextFunction): void {
  const estado = req.body?.estado;

  if (typeof estado !== "string" || !ESTADOS.includes(estado as EstadoPedido)) {
    return rechazar(res, "estado debe ser pendiente, confirmado o cancelado");
  }

  next();
}
