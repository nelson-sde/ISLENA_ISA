
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

// Generated by https://quicktype.io

export interface ChequeBD {
    coD_CIA:        string;
    coD_ZON:        string;
    coD_BCO:        string;
    coD_CLT:        string;
    nuM_REC:        string;
    nuM_CHE:        string;
    nuM_CTA:        string;
    moN_CHE:        number;
    tiP_DOC:        string;
    feC_CHE:        Date;
    noteExistsFlag: number;
    recordDate:     Date;
    rowPointer:     string;
    createdBy:      string;
    updatedBy:      string;
    createDate:     Date;
}

export interface ChequeBD2 {
    COD_CIA:        string;
    COD_ZON:        string;
    COD_BCO:        string;
    COD_CLT:        string;
    NUM_REC:        string;
    NUM_CHE:        string;
    NUM_CTA:        string;
    MON_CHE:        number;
    TIP_DOC:        string;
    FEC_CHE:        Date;
}

