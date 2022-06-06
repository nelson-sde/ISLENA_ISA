
export class LineasDev {
    constructor (
        public numFactura:  string,
        public fechaFac:    Date,
        public cliente:     string,
        public articulo:    string,
        public descArticulo: string,
        public precio:      number,
        public cantidad:    number,
        public cantDevuelta: number,
        public descuento:   number,
        public montoDesc:   number,
        public impuestos:   number,
        public monto:       number,      /// Agregarle los campos nuevos: Linea, Bodega, etc.
        public linea:       number,
        public bodega:      string,
        public descGeneral: number
    ){}
}

export class Devolucion {
    constructor (
        public numDevolucion: string,
        public cliente:     string,
        public numFactura:  string,
        public fecha:       Date,
        public fechaFin:    Date,
        public fechaFac:    Date,
        public comentarios: string,
        public numItems:    number,
        public listaPrecios: number,
        public montoSinIVA: number,
        public montoDesc:   number,
        public montoImp:    number,
        public bodega:      string,
        public nivelPrecios: string,
        public moneda:      string,
        public codGeo1:     string,
        public codGeo2:     string,
        public actividadCo: string,
        public envioExitoso: boolean = false,
        public lineas: DevolucionDet[] = []
    ){}
}

export class DevolucionDet {
    constructor (
        public articulo:        string,
        public montoLinea:      number,
        public precio:          number,
        public cantidadDev:     number,
        public commentLinea:    string,
        public montoDesc:       number,
        public descPorcen:      number,
        public tipoImp:         string,
        public tipoTarifa:      string,
        public porcenIVA:       number
    ){}
}

export class DevolucionFR {
    constructor ( 
        public nuM_DEV:     string,
        public linea:       number,
        public coD_CIA:     string,
        public coD_ZON:     string,
        public coD_CLT:     string,
        public hoR_INI:     Date,
        public hoR_FIN:     Date,
        public feC_DEV:     Date,
        public obS_DEV:     string,
        public nuM_ITM:     number,
        public lsT_PRE:     number,
        public moN_SIV:     number,
        public moN_DSC:     number,
        public poR_DSC_AP:  number,
        public moN_IMP_VT:  number,
        public moN_IMP_CS:  number,
        public coD_BOD:     string,
        public nuM_REF:     string,
        public niveL_PRECIO: string,
        public moneda:       string,
        public coD_GEO1:    string,
        public coD_GEO2:    string,
        public justI_DEV_HACIEND:   string,
        public actividaD_COMERCIAL: string,
        public coD_ART:      string,
        public inD_DEV:      string,
        public moN_TOT:      number,
        public moN_PRC_MX:   number,
        public cnT_MAX:      number,
        public arT_BON:      string,
        public tipO_IMPUESTO1:    string,
        public tipO_TARIFA1:      string,
        public porC_EXONERACION:  number,
        public montO_EXONERACION: number,
        public porC_IMPUESTO1:    number,
        public eS_OTRO_CARGO:     string,
        public eS_CANASTA_BASICA: string,
    ){}
}
