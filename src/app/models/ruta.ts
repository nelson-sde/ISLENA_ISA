
export interface RutaConfig {
    numRuta:        string;
    descripcion:    string;
    codVendedor:    number;
    nomVendedor:    string;
    usuario:        string;
    clave:          string;
    consecutivoPedidos: string;
    consecutivoRecibos: string;
    consecutivoDevoluciones: string;
    bodega:         number;
    emailCxC:       string;
    emailVendedor:  string;
    emailSupervisor: string;
    usaRecibos:     boolean;
    usuarioCxC:     string;
    claveCxC:       string;
    tipoCambio:     number;
    ultimaLiquid:   Date;
    darkMode:       boolean;
    actualizado:    string;
    borrarBD:       boolean;
    usaDevoluciones: boolean;
}
  
export interface Ruta {          // Objeto con la data de la vista de ISA_Rutas
    ruta:           string;
    handHeld:       string;
    grupO_Articulo: string;
    compania:       string;
    bodega:         number;
    agente:         string;
    pedido:         string;
    recibo:         string;
    devolucion:     string;
    emaiL_EJECUTIVA: string;
    emaiL_VENDEDOR: string;
    usA_RECIBOS:    string;
    tcom:           number;
    emaiL_SUPERVISOR: string;
    actualizado:    string;
    borraR_BD:      string;
    usA_DEVOLUCIONES: string;
}

// Generated by https://quicktype.io

export interface Cuota {
    anno:            number;
    mes:             number;
    ruta:            string;
    cuota:           number;
    venta_Bruta:     number;
    devoluciones:    number;
    c__Devoluciones: number;
    venta_Neta:      number;
    c__Alcance:      number;
    c__Margen:       number;
}

export class Rutero {
    cliente:  string;
    ruta:     string;
    inicio:   Date;
    razon:    string;
    fin:      Date;
    fecha_Plan: Date;
    tipo:     string;
    notas:    string;
    doc_Pro:  string;
    latitud:  number;
    longitud: number;
    pendiente: boolean;

    constructor ( cliente:  string,
                  ruta:     string){
        this.cliente = cliente;
        this.ruta = ruta;
        this.inicio = new Date();
        this.razon = 'N';
        this.fin = null;
        this.fecha_Plan = new Date();
        this.tipo = 'R';
        this.notas = '';
        this.doc_Pro = null;
        this.latitud = 0;
        this.longitud = 0;
        this.pendiente = false;
    }
}

// Generated by https://quicktype.io

export class VisitaBD {
    cliente:        string;
    ruta:           string;
    inicio:         Date;
    razon:          string;
    fin:            Date;
    fechA_PLAN:     Date;
    tipo:           string;
    notas:          string;
    doC_PRO:        string;
    noteExistsFlag: number;
    recordDate:     Date;
    rowPointer:     string;
    createdBy:      string;
    updatedBy:      string;
    createDate:     Date;
    latitud:        number;
    longitud:       number;

    constructor ( 
        cliente:        string,
        ruta:           string,
        inicio:         Date,
        razon:          string,
        fin:            Date,
        fechA_PLAN:     Date,
        tipo:           string,
        notas:          string,
        doC_PRO:        string,
        latitud:        number,
        longitud:       number){
        this.cliente = cliente;
        this.ruta = ruta;
        this.inicio = inicio;
        this.razon = razon;
        this.fin = fin;
        this.fechA_PLAN = fechA_PLAN;
        this.tipo = tipo;
        this.notas = notas;
        this.doC_PRO = doC_PRO;
        this.latitud = latitud;
        this.longitud = longitud;
        this.noteExistsFlag = 0;
        this.recordDate = new Date();
        this.rowPointer = '';
        this.createdBy = 'ISA';
        this.updatedBy = 'ISA';
        this.createDate = new Date();
        }
}

// Generated by https://quicktype.io

export class UbicacionBD {
    cliente:        string;
    ruta:           string;
    inicio:         Date;
    latitud:        number;
    longitud:       number;
    altitud:        number;
    tiempO_GPS:     Date;
    tiempO_PDA:     Date;
    pdop:           number;
    error:          string;
    noteExistsFlag: number;
    recordDate:     Date;
    rowPointer:     string;
    createdBy:      string;
    updatedBy:      string;
    createDate:     Date;

    constructor(
        cliente:        string,
        ruta:           string,
        inicio:         Date,
        latitud:        number,
        longitud:       number,
        altitud:        number,
        tiempO_GPS:     Date,
        tiempO_PDA:     Date,
        pdop:           number,
        error:          string,
    ) {
        this.cliente = cliente;
        this.ruta = ruta;
        this.inicio = inicio;
        this.latitud = latitud;
        this.longitud = longitud;
        this.altitud = altitud;
        this.tiempO_GPS = tiempO_GPS;
        this.tiempO_PDA = tiempO_PDA;
        this.pdop = pdop;
        this.error = error;
        this.noteExistsFlag = 0;
        this.recordDate = new Date();
        this.rowPointer = '';
        this.createdBy = 'ISA';
        this.updatedBy = 'ISA';
        this.createDate = new Date();
    }
}

export interface VisitaDiaria {
    ID:             string,
    ruta:           string,
    horaSincroniza: Date,
    latitud:        number,
    longitud:       number
}

export interface VisitaDiariaNew {
    ruta:           string,
    horaSincroniza: Date,
    latitud:        number,
    longitud:       number,
    Version:        string
}

export interface RutasDist {
  ruta: string;
  descripcion: string;
}

export interface Distritos {
  Cod_Provincia: string;
  Cod_Canton: string;
  Cod_Distrito: string;
  Distrito: string;
}

export interface Cantones {
  Cod_Provincia: string;
  Cod_Canton: string;
  Canton: string;
}

export interface RuteroBD {
  ruta: string;
  hora: Date;
  cliente: string;
  tipo: string;
  latitud: number;
  longitud: number;
}

