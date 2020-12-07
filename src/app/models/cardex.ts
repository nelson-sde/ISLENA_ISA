
export class Cardex {
    codCliente: number;
    codProducto: number;
    fecha: Date;
    aplicado: boolean;
    cantInventario: number;
    cantPedido: number;

    constructor ( idClient: number, idProd: number, cantInventario: number, cantPedido: number ){
        this.codCliente = idClient;
        this.codProducto = idProd;
        this.fecha = new Date();
        this.aplicado = false;
        this.cantInventario = cantInventario;
        this.cantPedido = cantPedido;
    }
}
