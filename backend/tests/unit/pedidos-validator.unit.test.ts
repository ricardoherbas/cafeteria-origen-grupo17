import type { Request, Response, NextFunction } from "express";
import {
  validarCrearPedido,
  validarIdPedido,
  validarCambioEstado,
} from "../../middlewares/pedidos-validator";

// Arma un req/res/next falsos para ejecutar el middleware directamente
function ejecutar(
  middleware: (req: Request, res: Response, next: NextFunction) => void,
  req: { body?: unknown; params?: Record<string, string> }
) {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  middleware(req as Request, res as unknown as Response, next);
  return { res, next };
}

function esperarRechazo({ res, next }: ReturnType<typeof ejecutar>) {
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  expect(next).not.toHaveBeenCalled();
}

function esperarPaso({ res, next }: ReturnType<typeof ejecutar>) {
  expect(next).toHaveBeenCalledTimes(1);
  expect(res.status).not.toHaveBeenCalled();
}

describe("validarCrearPedido", () => {
  it("deja pasar un pedido válido sin mesa", () => {
    esperarPaso(ejecutar(validarCrearPedido, { body: { items: [{ productoId: 1, cantidad: 2 }] } }));
  });

  it("deja pasar un pedido válido con mesa", () => {
    esperarPaso(
      ejecutar(validarCrearPedido, { body: { mesaId: 3, items: [{ productoId: 1, cantidad: 2 }] } })
    );
  });

  it.each([
    ["sin body", undefined],
    ["sin items", {}],
    ["items no es un array", { items: "hola" }],
    ["items vacío", { items: [] }],
    ["ítem sin productoId", { items: [{ cantidad: 1 }] }],
    ["ítem sin cantidad", { items: [{ productoId: 1 }] }],
    ["productoId en cero", { items: [{ productoId: 0, cantidad: 1 }] }],
    ["productoId negativo", { items: [{ productoId: -1, cantidad: 1 }] }],
    ["productoId decimal", { items: [{ productoId: 1.5, cantidad: 1 }] }],
    ["productoId como string", { items: [{ productoId: "1", cantidad: 1 }] }],
    ["cantidad en cero", { items: [{ productoId: 1, cantidad: 0 }] }],
    ["cantidad negativa", { items: [{ productoId: 1, cantidad: -2 }] }],
    ["cantidad decimal", { items: [{ productoId: 1, cantidad: 1.5 }] }],
    ["cantidad como string", { items: [{ productoId: 1, cantidad: "2" }] }],
    ["un ítem válido y otro inválido", { items: [{ productoId: 1, cantidad: 1 }, { productoId: 2, cantidad: 0 }] }],
    ["ítem que no es objeto", { items: [5] }],
    ["mesaId en cero", { mesaId: 0, items: [{ productoId: 1, cantidad: 1 }] }],
    ["mesaId decimal", { mesaId: 1.5, items: [{ productoId: 1, cantidad: 1 }] }],
    ["mesaId como string", { mesaId: "2", items: [{ productoId: 1, cantidad: 1 }] }],
  ])("responde 400 si %s", (_caso, body) => {
    esperarRechazo(ejecutar(validarCrearPedido, { body }));
  });
});

describe("validarIdPedido", () => {
  it("deja pasar un id entero positivo", () => {
    esperarPaso(ejecutar(validarIdPedido, { params: { id: "12" } }));
  });

  it.each([["abc"], ["0"], ["-3"], ["1.5"], [""], ["12abc"]])(
    "responde 400 si el id es %p",
    (id) => {
      esperarRechazo(ejecutar(validarIdPedido, { params: { id } }));
    }
  );
});

describe("validarCambioEstado", () => {
  it.each([["pendiente"], ["confirmado"], ["cancelado"]])(
    "deja pasar el estado %s",
    (estado) => {
      esperarPaso(ejecutar(validarCambioEstado, { body: { estado } }));
    }
  );

  it.each([
    ["sin body", undefined],
    ["sin estado", {}],
    ["estado desconocido", { estado: "entregado" }],
    ["estado en mayúsculas", { estado: "PENDIENTE" }],
    ["estado que no es string", { estado: 1 }],
  ])("responde 400 si %s", (_caso, body) => {
    esperarRechazo(ejecutar(validarCambioEstado, { body }));
  });
});
