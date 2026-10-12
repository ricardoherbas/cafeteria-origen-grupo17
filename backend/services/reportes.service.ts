//estas funciones reciben los pedidos ya traidos por reportes.repository.ts
//desde las tablas pedidos + pedido_items + productos y hacen las cuentas
 //aca para que sea facil de testear sin tocar la base.

export interface PedidoReporte {// molde del dato que se espera recibir
    id: number;
    estado: 'pendiente' | 'confirmado' | 'cancelado';
    total: number;
    items: {
        tipo: 'expreso' | 'filtrado' | 'pasteleria';
        cantidad: number;
        subtotal: number;
    }[];
}

export interface MasVendido {// es la descricion, un objeto
    tipo: string;
    cantidad: number;
}

function noEstaCancelado(pedido: PedidoReporte): boolean {
    return pedido.estado !== 'cancelado';
}

export async function facturacionTotal(pedidos: PedidoReporte[]): Promise<number> {
    return pedidos
        .filter(noEstaCancelado)// lista de pedidos, queda la con los que no estan cancelados
        .reduce((acumulado, pedido) => acumulado + pedido.total, 0);// toma el total de cada pedido, arranca desde 0
}

export async function cantidadPorTipo(pedidos: PedidoReporte[]): Promise<Record<string, number>> {
    const resultado: Record<string, number> = {};// 

    for (const pedido of pedidos.filter(noEstaCancelado)) {// recorre los pedidos ya filtrados sin los cancelados
        for (const item of pedido.items) {// entra a los items de cada pedido
            resultado[item.tipo] = (resultado[item.tipo] ?? 0) + item.cantidad;
        }
    }

    return resultado
}

export async function masVendido(pedidos: PedidoReporte[]): Promise<MasVendido | null> {
    const porTipo = await cantidadPorTipo(pedidos);
    const tipos = Object.keys(porTipo);

    if (tipos.length === 0) return null;

    const tipoGanador = tipos.sort().reduce((mejor, actual) =>
        porTipo[actual] > porTipo[mejor] ? actual : mejor
    );

    return { tipo: tipoGanador, cantidad: porTipo[tipoGanador] };
}