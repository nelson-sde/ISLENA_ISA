
export class DetallePedido {
    codProducto: number;
    descripcion: string;
    cantidad: number;
    subTotal: number;
    iva: number;
    descuento: number;
    total: number;

    constructor( id: number, des: string, cantidad: number, sub: number, iva: number, desc: number, total: number ){
        this.codProducto = id;
        this.descripcion = des;
        this.cantidad = cantidad;
        this.subTotal = sub;
        this.iva = iva;
        this.descuento = desc;
        this.total = total;
    }
}
