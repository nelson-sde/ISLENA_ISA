
export class DetallePedido {
    codProducto: number;
    cantidad: number;
    subTotal: number;
    iva: number;
    descuento: number;
    total: number;

    constructor( id: number, cantidad: number, sub: number, iva: number, desc: number, total: number ){
        this.codProducto = id;
        this.cantidad = cantidad;
        this.subTotal = sub;
        this.iva = iva;
        this.descuento = desc;
        this.total = total;
    }
}
