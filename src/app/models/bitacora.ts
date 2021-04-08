
export class Bitacora {
    fecha: Date;
    status: boolean;
    movimiento: string;
    linea: string

    constructor ( status: boolean, movimiento: string, linea: string ){
        this.fecha = new Date;
        this.status = status;
        this.linea = linea;
        this.movimiento = movimiento;
    }
}
