
export interface RutaConfig {
    numRuta: string;
    descripcion: string;
    codVendedor: number;
    nomVendedor: string;
    usuario: string;
    clave: string;
    consecutivoPedidos: string;
    consecutivoRecibos: string;
    consecutivoDevoluciones: string;
    bodega: number;
    emailCxC: string;
    emailVendedor: string
}
  
export interface Ruta {
    ruta: string;
    handHeld: string;
    grupo_Articulo: string;
    compania: string;
    bodega: number;
    agente: string;
    pedido: string;
    recibo: string;
    devolucion: string;
    emaiL_EJECUTIVA: string;
}

// Generated by https://quicktype.io

export interface Cuota {
    anno:            number;
    mes:             number;
    ruta:            string;
    cuota:           number;
    venta_Bruta:     number;
    devoluciones:    number;
    c__Devoluciones: number;
    venta_Neta:      number;
    c__Alcance:      number;
    c__Margen:       number;
}

