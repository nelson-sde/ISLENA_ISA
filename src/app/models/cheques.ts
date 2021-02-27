
export class Cheque {
    codigoBanco: string;
    codCliente: string;
    numeroRecibo: string;
    numeroCheque: string;
    numeroCuenta: string;
    monto: number;

    constructor ( codBanco: string, codCliente: string, recibo: string, cheque: string, cuenta: string, monto: number ){
        this.codigoBanco = codBanco;
        this.codCliente = codCliente;
        this.numeroRecibo = recibo;
        this.numeroCheque = cheque;
        this.numeroCuenta = cuenta;
        this.monto = monto;
    }
}
