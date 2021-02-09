
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
    divGeografica1: string;
    divGeografica2: string;
    moroso: boolean;
    email: string;

    constructor(id: number, nombre: string, dir: string, tipoCont: string, contri: string, razonSocial: string, telContacto: string,
        nomContacto: string, credito: number, limCredito: number, diasCred: number, listaPrecio: number, descuento: number, tipoImp: number,
        tarifa: number, porTarifa: number, divGeo1: string, divGeo2: string, moroso: string, email: string ){
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
        this.divGeografica1 = divGeo1;
        this.divGeografica2 = divGeo2;
        if (moroso == 'N'){
            this.moroso = false
        } else {
            this.moroso = true;
        }
        this.email = email;
    }
}

export interface ClienteBD {
    cod_Zon: string,
    cod_Clt: string,
    nom_Clt: string,
    dir_Clt: string,
    tipo_Tarifa: string,
    porc_Tarifa: number,
    tipo_Impuesto: string,
    cod_Cnd: string,
    cod_Pais: string,
    contribuyente: string,
    descuento: number,
    division_Geografica1: string,
    division_Geografica2: string,
    ind_Mon: string,
    lim_Cre: number,
    lst_Pre: number,
    nom_Cto: string,
    num_Tel: string,
    razonsocial: string,
    tipo_Contribuyente: string,
    moroso: string,
    e_MAIL: string,
}
