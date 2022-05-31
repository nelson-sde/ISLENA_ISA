
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
        public listaPrecios: string,
        public montoSinIVA: number,
        public montoDesc:   number,
        public montoImp:    number,
        public bodega:      string,
        public nivelPrecios: string,
        public moneda:      string,
        public codGeo1:     string,
        public codGeo2:     string,
        public actividadCo: string,
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

