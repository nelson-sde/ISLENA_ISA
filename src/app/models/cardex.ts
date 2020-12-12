
export class Cardex {
    codCliente: number;
    codProducto: number;
    desProducto: string;
    fecha: Date;
    aplicado: boolean;
    cantInventario: number;
    cantPedido: number;

    constructor ( idClient: number, idProd: number, desProd: string, cantInventario: number, cantPedido: number ){
        this.codCliente = idClient;
        this.codProducto = idProd;
        this.desProducto = desProd;
        this.fecha = new Date();
        this.aplicado = false;
        this.cantInventario = cantInventario;
        this.cantPedido = cantPedido;
    }
}
