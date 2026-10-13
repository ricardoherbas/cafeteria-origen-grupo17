import { PedidoReporte } from '../services/reportes.service';
import conexionDB from '../config/conexion-db';

export interface FilaReporte {
    pedido_id: number;
    estado: 'pendiente' | 'confirmado' | 'cancelado';
    total: string;
    tipo: 'expreso' | 'filtrado' | 'pasteleria' | null;
    cantidad: number | null;
    subtotal: string | null;
}

export function agruparFilas(filas: FilaReporte[]): PedidoReporte[] {
    const porPedido = new Map<number, PedidoReporte>();

    for (const fila of filas) {
        let pedido = porPedido.get(fila.pedido_id);

        if (!pedido) {
            pedido = {
                id: fila.pedido_id,
                estado: fila.estado,
                total: Number(fila.total),
                items: [],
            };
            porPedido.set(fila.pedido_id, pedido);
        }

        if (fila.tipo !== null && fila.cantidad !== null && fila.subtotal !== null) {
            pedido.items.push({
                tipo: fila.tipo,
                cantidad: fila.cantidad,
                subtotal: Number(fila.subtotal),
            });
        }
    }

    return Array.from(porPedido.values());
}

const SQL_PEDIDOS_CON_ITEMS = `
    SELECT
        p.id AS pedido_id,
        p.estado,
        p.total,
        pr.tipo,
        pi.cantidad,
        pi.subtotal
    FROM pedidos p
    LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
    LEFT JOIN productos pr ON pr.id = pi.producto_id
    ORDER BY p.id, pi.id
`;

export async function obtenerPedidosParaReportes(): Promise<PedidoReporte[]> {
    const resultado = await conexionDB.query<FilaReporte>(SQL_PEDIDOS_CON_ITEMS);
    return agruparFilas(resultado.rows);
}