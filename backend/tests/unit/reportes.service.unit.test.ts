import { facturacionTotal, cantidadPorTipo, masVendido, PedidoReporte } from '../../services/reportes.service';

const pedidosEjemplo: PedidoReporte[] = [
    {
        id: 1,
        estado: 'confirmado',
        total: 12540,
        items: [
        { tipo: 'expreso', cantidad: 2, subtotal: 10040 },
        { tipo: 'pasteleria', cantidad: 1, subtotal: 2500 },
        ],
    },
    { 
    id: 2,
    estado: 'pendiente',
    total: 4040,
    items: [
        { tipo: 'filtrado', cantidad: 1, subtotal: 4040 },
        ],
    },
    {
        id: 3,
        estado: 'cancelado',
        total: 50000,
        items: [
        { tipo: 'expreso', cantidad: 10, subtotal: 50000 },
        ],
    },
    ];

describe('facturacionTotal()', () => {
    test('suma los totales de los pedidos no cancelados', async () => {
        const resultado = await facturacionTotal(pedidosEjemplo);
        expect(resultado).toBe(16580);
    });
});

describe('cantidadPorTipo()', () => {
    test('agrupa las cantidades por tipo, excluyendo cancelados', async () => {
        const resultado = await cantidadPorTipo(pedidosEjemplo);
        expect(resultado).toEqual({ expreso: 2, pasteleria: 1, filtrado: 1 });
    });
});

describe('masVendido()', () => {
    test('devuelve el tipo con mayor cantidad', async () => {
        const resultado = await masVendido(pedidosEjemplo);
        expect(resultado).toEqual({ tipo: 'expreso', cantidad: 2 });
    });

    test('sin pedidos, devuelve null', async () => {
        const resultado = await masVendido([]);
        expect(resultado).toBeNull();
    });

    test('en caso de empate, gana el primero por orden alfabético', async () => {
        const pedidosEmpatados: PedidoReporte[] = [
        {
            id: 10,
            estado: 'confirmado',
            total: 0,
            items: [
            { tipo: 'filtrado', cantidad: 3, subtotal: 0 },
            { tipo: 'expreso', cantidad: 3, subtotal: 0 },
            ],
        },
        ];

        const resultado = await masVendido(pedidosEmpatados);
        expect(resultado).toEqual({ tipo: 'expreso', cantidad: 3 });
    });
});