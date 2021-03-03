
export class Cardex {
    codCliente: string;
    codProducto: string;
    desProducto: string;
    tipoDocumento: string;
    fecha: Date;
    aplicado: boolean;
    cantInventario: number;
    cantPedido: number;

    constructor ( idClient: string, idProd: string, desProd: string, tipoDocum: string, fecha: Date, cantInventario: number, cantPedido: number ){
        this.codCliente = idClient;
        this.codProducto = idProd;
        this.desProducto = desProd;
        this.tipoDocumento = tipoDocum;
        this.fecha = fecha;
        this.aplicado = false;
        this.cantInventario = cantInventario;
        this.cantPedido = cantPedido;
    }
}

export class CardexBD {
    ruta: string;
    tipO_DOCUMENTO: string;
    fecha: Date;
    cliente: string;
    articulo: string;
    cantidad: number;

    constructor ( ruta: string, tipDocu: string, fecha: Date, clienteId: string, codProd: string, cantidad: number ){
        this.ruta = ruta;
        this.tipO_DOCUMENTO = tipDocu;
        this.fecha = fecha;
        this.cliente = clienteId;
        this.articulo = codProd;
        this.cantidad = cantidad;
    }
}
