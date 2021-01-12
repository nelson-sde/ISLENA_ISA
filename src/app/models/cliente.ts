
export class Cliente {
    id: number;
    nombre: string;
    direccion: string;
    tipoContribuyente: string;   // F: Fisico, J: Juridico
    contribuyente: string;       // cedula del representante
    razonSocial: string;         // nombre legal
    telefonoContacto: string; 
    nombreContacto: string;
    montoCredito: number;
    limiteCredito: number;
    diasCredito: number;
    listaPrecios: number;
    descuento: number;
    tipoImpuesto: number;
    tarifa: number;              // Refiere al tipo de impuesto
    porcentajeTarifa: number;    // Refiere al porcentaje del IVA

    constructor(id: number, nombre: string, dir: string, tipoCont: string, contri: string, razonSocial: string, telContacto: string,
        nomContacto: string, credito: number, limCredito: number, diasCred: number, listaPrecio: number, descuento: number, tipoImp: number,
        tarifa: number, porTarifa: number ){
        this.id = id;
        this.nombre = nombre;
        this.direccion = dir;
        this.tipoContribuyente = tipoCont;
        this.contribuyente = contri;
        this.razonSocial = razonSocial;
        this.telefonoContacto = telContacto;
        this.nombreContacto = nomContacto;
        this.montoCredito = credito;
        this.limiteCredito = limCredito;
        this.diasCredito = diasCred;
        this.listaPrecios = listaPrecio;
        this.descuento = descuento;
        this.tipoImpuesto = tipoImp;
        this.tarifa = tarifa;
        this.porcentajeTarifa = porTarifa;
    }
}

export interface ClienteBD {
    COD_ZON: string,
    COD_CLT: string,
    NOM_CLT: string,
    DIR_CLT: string,
    TIPO_TARIFA: string,
    PORC_TARIFA: number,
    TIPO_IMPUESTO: string,
    COD_CND: string,
    COD_PAIS: string,
    CONTRIBUYENTE: string,
    DESCUENTO: number,
    DIVISION_GEOGRAFICA1: string,
    DIVISION_GEOGRAFICA2: string,
    IND_MON: string,
    LIM_CRE: number,
    LST_PRE: number,
    NOM_CTO: string,
    NUM_TEL: string,
    RAZONSOCIAL: string,
    TIPO_CONTRIBUYENTE: string,
    ID: string
}
