import { PedidoReporte } from '../services/reportes.service';

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