import { DetallePedido } from './detallePedido';

export class Pedido {
    numPedido: string;
    codCliente: number;
    fecha: Date;
    subTotal: number;
    iva: number;
    descuento: number;
    total: number;
    detalle: DetallePedido[];

    constructor ( numPedido: string, id: number, subTotal: number, iva: number, desc: number, total: number ){
        this.numPedido = numPedido;
        this.codCliente = id;
        this.fecha = new Date();
        this.subTotal = subTotal;
        this.iva = iva;
        this.descuento = desc;
        this.total = total;
        this.detalle = [];
    }
}
