import { Request, Response, NextFunction } from 'express';
import { obtenerPedidosParaReportes } from '../repositories/reportes.repository';
import { facturacionTotal, masVendido } from '../services/reportes.service';
import { AppError } from '../middlewares/error-handler';


export async function getFacturacion(req: Request, res: Response, next: NextFunction) {
    try {
        const pedidos = await obtenerPedidosParaReportes();
        const total = await facturacionTotal(pedidos);
        res.status(200).json({ facturacionTotal: total });
    } catch (error) {
        next(error);// el error se dervia hacia errorHandler
    }
}

export async function getMasVendido(req: Request, res: Response, next: NextFunction) {
    try {
        const pedidos = await obtenerPedidosParaReportes();
        const resultado = await masVendido(pedidos);

        if (resultado === null) {
        throw new AppError('No hay ventas registradas', 404);
        }

        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
}
