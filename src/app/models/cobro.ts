
export class Pen_Cobro {    // Estructura de la CxC en el Local Storage
    numeroRuta: string;
    tipoDocumen: string;
    numeroDocumen: string;
    codCliente: string;
    saldoDolar: number;
    saldoLocal: number;
    montoDolar: number;
    montoLocal: number;
    fechaDoc: Date;
    fechaVencimiento: Date;
    condicionPago: string;
    pago: boolean;

    constructor ( ruta: string, tipDoc: string, numDoc: string, codCliente: string, saldoD: number, saldoL: number, montoD: number, 
                  montoL: number, fecDoc: Date, fecVen: Date, conPago: string ){
        this.numeroRuta = ruta;
        this.tipoDocumen = tipDoc;
        this.numeroDocumen = numDoc;
        this.codCliente = codCliente;
        this.saldoDolar = saldoD;
        this.saldoLocal = saldoL;
        this.montoDolar = montoD;
        this.montoLocal = montoL;
        this.fechaDoc = fecDoc;
        this.fechaVencimiento = fecVen;
        this.condicionPago = conPago;
        this.pago = false;
    }
}

// Generated by https://quicktype.io

export interface CxCBD {
    coD_CIA:        string;
    coD_ZON:        string;
    coD_TIP_DC:     string;
    nuM_DOC:        string;
    coD_CLT:        string;
    saldO_DOLAR:    number;
    saldO_LOCAL:    number;
    montO_DOLAR:    number;
    montO_LOCAL:    number;
    feC_DOC_FT:     string;
    feC_PRO:        string;
    feC_VEN:        string;
    inD_MON:        string;
    inD_ANL:        string;
    tiP_CMB_DOL:    number;
    condicioN_PAGO: string;
    subtotal:       number;
    tiP_CMB_LOC:    number;
}

export class Det_Recibo {
    tipoDocumen: string;
    numeroDocumen: string;
    numeroDocumenAf: string;
    ncAsignada: boolean;
    fechaDocu: Date;
    saldoDolar: number;
    saldoLocal: number;
    montoDolar: number;
    montoLocal: number;
    abonoLocal: number;
    abonoDolar: number;
    saldoNCFL: number;
    saldoNCFD: number;
    saldoAntL: number;
    saldoAntD: number;

    constructor ( tipDocu: string, numDocu: string, ncAsignada: boolean, fecha: Date, saldoD: number, saldoL: number, montoD: number, montoL: number, abonoL: number, abonoD: number, saldoAntL: number, saldoAntD: number ){
        this.tipoDocumen = tipDocu;
        this.numeroDocumen = numDocu;
        this.numeroDocumenAf = numDocu;
        this.ncAsignada = ncAsignada;
        this.fechaDocu = new Date(fecha);
        this.saldoDolar = saldoD;
        this.saldoLocal = saldoL;
        this.montoDolar = montoD;
        this.montoLocal = montoL;
        this.abonoDolar = abonoD;
        this.abonoLocal = abonoL;
        this.saldoAntL = saldoAntL;
        this.saldoAntD = saldoAntD;
        this.saldoNCFL = 0;
        this.saldoNCFD = 0;
    }
}

export class Recibo {
    numeroRuta: string;
    codCliente: string;
    numeroRecibo: string;
    fecha: Date;
    montoDolar: number;
    montoLocal: number;
    montoEfectivoD: number;
    montoEfectivoL: number;
    montoChequeD: number;
    montoChequeL: number;
    montoDepositoD: number;
    montoDepositoL: number;
    montoTarjetaD: number;
    montoTarjetaL: number;
    observaciones: string;
    envioExitoso: boolean;
    liquidado: boolean;
    moneda: string;
    anulado: boolean;
    tipoDoc: string;
    numTR: string;           // Número de la transferencia
    otrosMov: number;
    monto_NC: number;
    horaFin: Date;
    bancoDep: string;
    detalle: Det_Recibo[];

    constructor ( ruta: string, cliente: string, recibo: string, montoD: number, montoL: number, efectivoL: number, efectivoD: number, chequeL: number, chequeD: number,
                  depositoL: number, depositoD: number, tarjetaL: number, tarjetaD: number, observaciones: string, moneda: string ){
        this.numeroRuta = ruta;
        this.codCliente = cliente;
        this.numeroRecibo = recibo;
        this.fecha = new Date();
        this.montoDolar = montoD;
        this.montoLocal = montoL;
        this.montoEfectivoL = efectivoL;
        this.montoEfectivoD = efectivoD;
        this.montoChequeL = chequeL;
        this.montoChequeD = chequeD;
        this.montoDepositoL = depositoL;
        this.montoDepositoD = depositoD;
        this.montoTarjetaL = tarjetaL;
        this.montoTarjetaD = tarjetaD;
        this.observaciones = observaciones;
        this.moneda = moneda;
        this.envioExitoso = false;
        this.liquidado = false;
        this.anulado = false;
        this.tipoDoc = 'R';
        this.numTR = null;
        this.otrosMov = 0;
        this.monto_NC = 0;
        this.horaFin = new Date();
        this.bancoDep = null;
        this.detalle = [];
    }
}

// Generated by https://quicktype.io

export interface RecEncaBD {
    coD_CIA:          string;
    nuM_REC:          string;
    coD_TIP_DC:       string;
    coD_ZON:          string;
    coD_CLT:          string;
    feC_PRO:          Date;
    inD_ANL:          string;
    inD_MON:          string;
    moN_DOC_LOC:      number;
    moN_DOC_DOL:      number;
    moN_EFE_LOCAL:    number;
    moN_EFE_DOLAR:    number;
    moN_CHE_DOLAR:    number;
    moN_CHE_LOCAL:    number;
    hoR_INI:          Date;
    hoR_FIN:          Date;
    doC_PRO:          string;
    impreso:          string;
    noteExistsFlag:   number;
    recordDate:       Date;
    rowPointer:       string;
    createdBy:        string;
    updatedBy:        string;
    createDate:       Date;
    ncfmodificado:    string;
    moN_TAR_LOCAL:    number;
    moN_TAR_DOLAR:    number;
    moN_TRANS_LOCAL:  number;
    moN_TRANS_DOLAR:  number;
    moN_DEP_LOCAL:    number;
    moN_DEP_DOLAR:    number;
    moN_BONCER_LOCAL: number;
    moN_BONCER_DOLAR: number;
    APLICACION:       string;
}

// Generated by https://quicktype.io

export class RecDetaBD {
    coD_CIA:        string;
    coD_TIP_DC:     string;
    coD_ZON:        string;
    nuM_REC:        string;
    nuM_DOC:        string;
    coD_TIP_DA:     string;
    nuM_DOC_AF:     string;
    coD_CLT:        string;
    feC_DOC:        Date;
    feC_PRO:        Date;
    inD_ANL:        string;
    moN_MOV_LOCAL:  number;
    moN_MOV_DOL:    number;
    moN_SAL_LOC:    number;
    moN_SAL_DOL:    number;
    doC_PRO:        string;
    noteExistsFlag: number;
    recordDate:     Date;
    rowPointer:     string;
    createdBy:      string;
    updatedBy:      string;
    createDate:     Date;
    ncF_PREFIJO:    string;
    ncf:            string;

    constructor (){
        this.coD_CIA =        'ISLENA';
        this.coD_TIP_DC =     '';                     // 5 para recibo, un 7 para NC
        this.coD_ZON =        '';
        this.nuM_REC =        '';
        this.nuM_DOC =        '';
        this.coD_TIP_DA =     '1';
        this.nuM_DOC_AF =     '';
        this.coD_CLT =        '';
        this.feC_DOC =        new Date();
        this.feC_PRO =        new Date();
        this.inD_ANL =        'A';
        this.moN_MOV_LOCAL =  0;
        this.moN_MOV_DOL =    0;
        this.moN_SAL_LOC =    0;
        this.moN_SAL_DOL =    0;
        this.doC_PRO =        null;
        this.noteExistsFlag = 0;
        this.recordDate =     new Date();
        this.rowPointer =     '';
        this.createdBy =      'ISA';
        this.updatedBy =      'ISA';
        this.createDate =     new Date();
        this.ncF_PREFIJO =    null;
        this.ncf =            null;
    }
}

// Generated by https://quicktype.io

export interface Ejecutivas {
    empleado:         string;
    usuario:          string;
    clave:            string;
    email:            string;
    nombre:           string;
    email_Supervisor: string;
}

// Generated by https://quicktype.io

export interface RecAnulado {    // Interface de ISA_Liquid
    coD_CIA:       string;
    nuM_REC:       string;
    coD_TIP_DC:    string;
    ruta:          string;
    coD_CLT:       string;
    feC_PRO:       Date;
    moN_DOC_LOC:   number;
    moN_DOC_DOL:   number;
    moN_EFE_LOCAL: number;
    moN_EFE_DOLAR: number;
    moN_CHE_DOLAR: number;
    moN_CHE_LOCAL: number;
    doC_LIQ:       string;
    feC_LIQ:       string;
    ejecutivA_CXC: string;
    aplicacion:    string;
    recordDate:    Date;
    createdBy:     string;
    updatedBy:     string;
    createDate:    Date;
    inD_MON:       string;
    montO_OTR:     number;
    montO_NC:      number;
}

/*
export interface Otros_Mov {
    ruta: string,
    cod_Clt: string,
    num_Rec: string,
    monto: number,
    monto_NC: number,
    descripcion: string
}*/

// Generated by https://quicktype.io

export interface Liquidaciones {
    coD_CIA:       string;
    nuM_REC:       string;
    coD_TIP_DC:    string;
    ruta:          string;
    coD_CLT:       string;
    feC_PRO:       Date;
    moN_DOC_LOC:   number;
    moN_DOC_DOL:   number;
    moN_EFE_LOCAL: number;
    moN_EFE_DOLAR: number;
    moN_CHE_DOLAR: number;
    moN_CHE_LOCAL: number;
    doC_LIQ:       string;
    feC_LIQ:       Date;
    ejecutivA_CXC: string;
    aplicacion:    string;
    recordDate:    Date;
    createdBy:     string;
    updatedBy:     string;
    createDate:    Date;
    inD_MON:       string;
    montO_OTR:     number;
    montO_NC:      number;
}

export class ReciboBD {
    constructor(
        public coD_CIA:         string,
        public nuM_REC:         string,
        public coD_TIP_DC:      string,
        public linea:           number,
        public coD_ZON:         string,
        public coD_CLT:         string,
        public nuM_DOC:         string,
        public nuM_DOC_AF:      string,
        public feC_DOC:         Date,
        public feC_PRO:         Date,
        public inD_ANL:         string,
        public inD_MON:         string,
        public tipO_CAMBIO:     number,
        public moN_DOC_LOC:     number,
        public moN_EFE_LOCAL:   number,
        public moN_CHE_LOCAL:   number,
        public hoR_INI:         Date,
        public hoR_FIN:         Date,
        public moN_TAR_LOCAL:   number,
        public moN_TRANS_LOCAL: number,
        public moN_DEP_LOCAL:   number,
        public moN_BONCER_LOCAL: number,
        public moN_SAL_LOC:     number,
        public ruta:            string,
        public bancO_DEP:       string,
        public montO_NC:        number,
        public montO_OTROS:     number,
        public aplicacion:      string,
        public latitud :        number,
        public longitud:        number,
    ){}
}

