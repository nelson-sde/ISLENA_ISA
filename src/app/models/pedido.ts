

export class DetallePedido {
    codProducto: string;
    descripcion: string;
    precio: number;
    cantidad: number;
    subTotal: number;
    iva: number;
    descuento: number;
    descGeneral: number;
    total: number;
    impuesto: string;
    esCanastaBasica: string;
    porcenDescuento: number;
    porcenIVA: number;
    montoExonerado: number;
    porcenExonerado: number;
    frio: boolean;

    constructor( id: string, des: string, precio: number, cantidad: number, sub: number, iva: number, desc: number, descGen: number, total: number, impuesto: string, 
                 esCanBa: string, pDescuento: number, pIVA: number, montoExo: number, pExo: number, frio: boolean ){
        this.codProducto = id;
        this.descripcion = des;
        this.precio = precio;
        this.cantidad = cantidad;
        this.subTotal = sub;
        this.iva = iva;
        this.descuento = desc;
        this.descGeneral = descGen;
        this.total = total;
        this.impuesto = impuesto;
        this.esCanastaBasica = esCanBa;
        this.porcenDescuento = pDescuento;
        this.porcenIVA = pIVA;
        this.montoExonerado = montoExo;
        this.porcenExonerado = pExo;
        this.frio = frio;
    }
}

export class Pedido {
    numPedido: string;
    codCliente: string;
    fecha: Date;
    fechaEntrega: Date;
    subTotal: number;
    iva: number;                             // IVA = (subtotal - descuento - descuentoGeneral) * % del impuesto
    descuento: number;                      // monto del descuento por linea. descuento = subtotal * %desclinea
    porcentajeDescGeneral: number;         // % del descuento general
    descGeneral: number;                  // monto del descuento general = (Subtotal - descuento) * porcentajeDescGeneral
    total: number;
    detalle: DetallePedido[];
    observaciones: string;
    envioExitoso: boolean;
    horaFin?: Date;
    latitud?: number;
    longitud?: number;

    constructor ( numPedido: string, idCliente: string, fecha: Date, subTotal: number, iva: number, desc: number, porDesGen: number, descGen:number, total: number, obser: string, 
                  fecha_despacho: Date, exito: boolean, horaFin: Date ){
        this.numPedido = numPedido;
        this.codCliente = idCliente;
        this.fecha = fecha;
        this.fechaEntrega = fecha_despacho;
        this.subTotal = subTotal;
        this.iva = iva;
        this.descuento = desc;
        this.porcentajeDescGeneral = porDesGen;
        this.descGeneral = descGen;
        this.total = total;
        this.detalle = [];
        this.observaciones = obser;
        this.envioExitoso = exito;
        this.horaFin = horaFin;
    }
}

export class PedEnca {
    COD_CIA: string;
    NUM_PED: string;
    COD_ZON: string;
    coD_CLT: string;
    TIP_DOC: string;
    HOR_FIN: Date;
    FEC_PED: Date;
    FEC_DES: Date;
    HOR_INI: Date;
    MON_IMP_VT: number;
    MON_IMP_CS: number;
    MON_CIV: number;
    MON_SIV: number;
    MON_DSC: number;   // Sumatoria Descuento por linea
    NUM_ITM: number;
    LST_PRE: number;
    OBS_PED: string;
    DOC_PRO: string;
    ESTADO: string;
    COD_CND: string;
    COD_BOD: string;
    COD_PAIS: string;
    CLASE: string;
    DIR_ENT: string;
    DESC1: number;
    DESC2: number;
    MONT_DESC1: number;  // Sumatoria Descuento General
    MONT_DESC2: number;
    DESCUENTO_CASCADA: string;
    IMPRESO: string;
    CONSIGNACION: string;
    NCF_PREFIJO: string;
    FACTURA_UNICA: string;
    NCF: string;
    NIVEL_PRECIO: string;
    MONEDA: string;
    NoteExistsFlag: number;
    RecordDate: Date;
    RowPointer: string;
    CreatedBy: string;
    UpdatedBy: string;
    CreateDate: Date;
    SERIE_RESOLUCION: string;
    COD_GEO1: string;
    COD_GEO2: string;
    CONSEC_RESOLUCION: number;
    TIPO_ANULACION: string;
    CLAVE_DE: string;
    ACTIVIDAD_COMERCIAL: string;

    constructor (COD_CIA: string, NUM_PED: string, COD_ZON: string, COD_CLT: string, TIP_DOC: string, HOR_FIN: Date, FEC_PED: Date, FEC_DES: Date,
                 HOR_INI: Date, MON_IMP_VT: number, MON_IMP_CS: number, MON_CIV: number, MON_SIV: number, MON_DSC: number, NUM_ITM: number, LST_PRE: number,
                 OBS_PED: string, DOC_PRO: string, ESTADO: string, COD_CND: string, COD_BOD: string, COD_PAIS: string, CLASE: string, DIR_ENT: string,
                 DESC1: number, DESC2: number, MONT_DESC1: number, MONT_DESC2: number, DESC_CAS: string, IMPRESO: string, CONSIG: string, NCF_PREFIJO: string, 
                 FAC_UNICA: string, NCF: string, NIVEL_PRE: string, MONEDA: string, noteExiste: number, record: Date, rowPoint: string, createBy: string, 
                 updateBy: string, create: Date, SERIE_RESOL: string, COD_GEO1: string, COD_GEO2: string, CONSEC_RES: number, TIPO_ANUL: string, CLAVE_DE: string, 
                 ACT_COMER: string){
        this.COD_CIA = COD_CIA;
        this.NUM_PED = NUM_PED;
        this.COD_ZON = COD_ZON;
        this.coD_CLT = COD_CLT;
        this.TIP_DOC = TIP_DOC;
        this.HOR_FIN = HOR_FIN;
        this.FEC_PED = new Date(FEC_PED);
        this.FEC_DES = new Date(FEC_DES);
        this.HOR_INI = new Date(HOR_INI);
        this.MON_IMP_VT = MON_IMP_VT;
        this.MON_IMP_CS = MON_IMP_CS;
        this.MON_CIV = MON_CIV;
        this.MON_SIV = MON_SIV;
        this.MON_DSC = MON_DSC;
        this.NUM_ITM = NUM_ITM;
        this.LST_PRE = LST_PRE;
        this.OBS_PED = OBS_PED;
        this.DOC_PRO = DOC_PRO;
        this.ESTADO = ESTADO;
        this.COD_CND = COD_CND;
        this.COD_BOD = COD_BOD;
        this.COD_PAIS = COD_PAIS;
        this.CLASE = CLASE;
        this.DIR_ENT = DIR_ENT;
        this.DESC1 = DESC1;
        this.DESC2 = DESC2;
        this.MONT_DESC1 = MONT_DESC1;
        this.MONT_DESC2 = MONT_DESC2;
        this.DESCUENTO_CASCADA = DESC_CAS;
        this.IMPRESO = IMPRESO;
        this.CONSIGNACION = CONSIG;
        this.NCF_PREFIJO = NCF_PREFIJO;
        this.FACTURA_UNICA = FAC_UNICA;
        this.NCF = NCF;
        this.NIVEL_PRECIO = NIVEL_PRE;
        this.MONEDA = MONEDA;
        this.NoteExistsFlag = noteExiste;
        this.RecordDate = record;
        this.RowPointer = rowPoint;
        this.CreatedBy = createBy;
        this.UpdatedBy = updateBy;
        this.CreateDate = create;
        this.SERIE_RESOLUCION = SERIE_RESOL;
        this.COD_GEO1 = COD_GEO1;
        this.COD_GEO2 = COD_GEO2;
        this.CONSEC_RESOLUCION = CONSEC_RES;
        this.TIPO_ANULACION = TIPO_ANUL;
        this.CLAVE_DE = CLAVE_DE;
        this.ACTIVIDAD_COMERCIAL = ACT_COMER;
    }
}

export class PedDeta {
    NUM_LN: number;
    NUM_PED: string;
    COD_CIA: string;
    COD_ART: string;
    ART_BON: string;
    TIP_DOC: string;
    MON_PRC_MN: number;
    POR_DSC_AP: number;
    MON_TOT: number;
    MON_DSC: number;
    MON_PRC_MX: number;
    CNT_MAX: number;
    CNT_MIN: number;
    COD_ART_RFR: string;
    LST_PRE: number;
    TOPE: string;
    NoteExistsFlag: number;
    RecordDate: Date;
    RowPointer: string;
    CreatedBy: string;
    UpdatedBy: string;
    CreateDate: Date;
    TIPO_IMPUESTO1: string;
    TIPO_TARIFA1: string;
    TIPO_IMPUESTO2: string;
    TIPO_TARIFA2: string;
    PORC_EXONERACION: number;
    MONTO_EXONERACION: number;
    PORC_IMPUESTO1: number;
    PORC_IMPUESTO2: number;
    ES_OTRO_CARGO: string;
    ES_CANASTA_BASICA: string;

    constructor( NUM_LN: number, NUM_PED: string, COD_CIA: string, COD_ART: string, ART_BON: string, TIP_DOC: string, MON_PRC_MN: number,
                 POR_DSC_AP: number, MON_TOT: number, MON_DSC: number, MON_PRC_MX: number, CNT_MAX: number, CNT_MIN: number, COD_ART_RFR: string,
                 LST_PRE: number, TOPE: string, noteExiste: number, record: Date, rowPoint: string, createBy: string, updateBy: string, create: Date, 
                 TIPO_IMP1: string, TIPO_TAR1: string, TIPO_IMP2: string, TIPO_TAR2: string, PORC_EXO: number,
                 MONTO_EXO: number, PORC_IMP1: number, PORC_IMP2: number, ES_OTRO_CARGO: string, ES_CANASTA_BAS: string ){
        this.NUM_LN = NUM_LN;
        this.NUM_PED = NUM_PED;
        this.COD_CIA = COD_CIA;
        this.COD_ART = COD_ART;
        this.ART_BON = ART_BON;
        this.TIP_DOC = TIP_DOC;
        this.MON_PRC_MN = MON_PRC_MN;
        this.POR_DSC_AP = POR_DSC_AP;
        this.MON_TOT = MON_TOT;
        this.MON_DSC = MON_DSC;
        this.MON_PRC_MX = MON_PRC_MX;
        this.CNT_MAX = CNT_MAX;
        this.CNT_MIN = CNT_MIN;
        this.COD_ART_RFR = COD_ART_RFR;
        this.LST_PRE = LST_PRE;
        this.TOPE = TOPE;
        this.NoteExistsFlag = noteExiste;
        this.RecordDate = record;
        this.RowPointer = rowPoint;
        this.CreatedBy = createBy;
        this.UpdatedBy = updateBy;
        this.CreateDate = create;
        this.TIPO_IMPUESTO1 = TIPO_IMP1;
        this.TIPO_TARIFA1 = TIPO_TAR1;
        this.TIPO_IMPUESTO2 = TIPO_IMP2;
        this.TIPO_TARIFA2 = TIPO_TAR2;
        this.PORC_EXONERACION = PORC_EXO;
        this.MONTO_EXONERACION = MONTO_EXO;
        this.PORC_IMPUESTO1 = PORC_IMP1;
        this.PORC_IMPUESTO2 = PORC_IMP2;
        this.ES_OTRO_CARGO = ES_OTRO_CARGO;
        this.ES_CANASTA_BASICA = ES_CANASTA_BAS;
    }
}

export class Pendientes {
    fecha: Date;
    numPedido: string;
    codCliente: string;
    isChecked: boolean;

    constructor ( fecha: Date, NumPedido: string, codCliente: string, isCheck: boolean ){
        this.fecha = fecha;
        this.numPedido = NumPedido;
        this.codCliente = codCliente;
        this.isChecked = isCheck;
    }
}

// Generated by https://quicktype.io

export class Existencias {
    articulo:   string;
    bodega:     string;
    existencia: number;

    constructor ( codProducto: string, bodega: string, existencia: number ){
        this.articulo = codProducto;
        this.bodega = bodega;
        this.existencia = existencia;
    }
}

export class Exoneraciones {    // Listado con las Exoneraciones de impuestos
    cliente: string;
    codigO_ARTICULO: string;
    porcentaje: number;
    fechA_RIGE: Date;
    fechA_VENCE: Date;

    constructor ( cliente: string, codProducto: string, porcentaje: number, rige: Date, vence: Date ){
        this.cliente = cliente;
        this.codigO_ARTICULO = codProducto;
        this.porcentaje = porcentaje;
        this.fechA_RIGE = rige;
        this.fechA_VENCE = vence;
    }
}

export interface Entregas {
  fecha: Date;
  ruta: string;
  idGuia: string;
  idCamion: string;
  chofer: string;
  idCliente: string;
  nombre: string;
  direccion: string;
  checkin: string;
  observaciones: string;
  estado: string;
  bultos: number;
  checkout: string;
  orden_Visita: number;
  duracion: number;
  distancia: number;
}

export class PedidoWhatsappPut {
    constructor(
        public IdCliente: string,
        public Pedido:    string,
        public linea:     number,
        public Fecha:     Date,
        public CantidadLineas: number,
        public articulo:  string,
        public CantidadPedida: number,
        public Precio:    number,
        public PorcenDescuento: number,
        public Sincronizado: string,
        public Notificado: string,
    ){}
}

export interface PedidoWhatsappGet {
  idCliente:        string;
  ruta:             string;
  nom_Clt:          string;
  pedido:           string;
  fecha:            Date;
  linea:            number;
  cantidadLineas:   number;
  articulo:         string;
  cantidadPedida:   number;
  precio:           number;
  porcenDescuento:  number;
}

export class PedidoWhatsApp {
    constructor(
        public idCliente: string,
        public nom_Clt:   string,
        public pedido:    string,
        public fecha:     Date,
        public detalle:   PedWhatsAppDet[] = [],
    ){}
}

export class PedWhatsAppDet {
    constructor (
        public articulo:        string,
        public descripcion:     string,
        public cantidadPedida:  number,
        public precio:          number,
        public porcenDescuento: number,
    ){}
}

export interface BackOrders {
  factura:          string;
  clientE_ORIGEN:   string;
  nom_Clt:          string;
  ruta:             string;
  u_GUIA_ENTREGA:   string;
  fecha:            Date;
  articulo:         string;
  descripcion:      string;
  cantidaD_PEDIDA:  number;
  cantidaD_FACTURADA: number;
}


