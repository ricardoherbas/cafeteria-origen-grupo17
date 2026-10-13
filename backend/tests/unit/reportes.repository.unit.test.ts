import { agruparFilas, FilaReporte } from '../../repositories/reportes.repository';

describe('agruparFilas', () => {
    it('devuelve lista vacia si no hay filas', () => {
        expect(agruparFilas([])).toEqual([]);
    });

    it('junta en un solo pedido las filas que comparten pedido_id', () => {
        const filas: FilaReporte[] = [
            { pedido_id: 1, estado: 'confirmado', total: '14240.00', tipo: 'expreso', cantidad: 2, subtotal: '10040.00' },
            { pedido_id: 1, estado: 'confirmado', total: '14240.00', tipo: 'pasteleria', cantidad: 1, subtotal: '4200.00' },
        ];

        expect(agruparFilas(filas)).toEqual([
            {
                id: 1,
                estado: 'confirmado',
                total: 14240,
                items: [
                    { tipo: 'expreso', cantidad: 2, subtotal: 10040 },
                    { tipo: 'pasteleria', cantidad: 1, subtotal: 4200 },
                ],
            },
        ]);
    });

    it('separa los pedidos distintos', () => {
        const filas: FilaReporte[] = [
            { pedido_id: 1, estado: 'confirmado', total: '2500.00', tipo: 'pasteleria', cantidad: 1, subtotal: '2500.00' },
            { pedido_id: 2, estado: 'cancelado', total: '3200.00', tipo: 'filtrado', cantidad: 1, subtotal: '3200.00' },
        ];

        const pedidos = agruparFilas(filas);

        expect(pedidos).toHaveLength(2);
        expect(pedidos[0].id).toBe(1);
        expect(pedidos[1].id).toBe(2);
        expect(pedidos[1].estado).toBe('cancelado');
    });

    it('devuelve un pedido sin items cuando la fila no tiene producto', () => {
        const filas: FilaReporte[] = [
            { pedido_id: 7, estado: 'pendiente', total: '0.00', tipo: null, cantidad: null, subtotal: null },
        ];

        expect(agruparFilas(filas)).toEqual([
            { id: 7, estado: 'pendiente', total: 0, items: [] },
        ]);
    });
});