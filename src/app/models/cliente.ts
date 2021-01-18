
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
    Cod_Zon: string,
    Cod_Clt: string,
    Nom_Clt: string,
    Dir_Clt: string,
    Tipo_Tarifa: string,
    Porc_Tarifa: number,
    Tipo_Impuesto: string,
    Cod_Cnd: string,
    Cod_Pais: string,
    Contribuyente: string,
    Descuento: number,
    Division_Geografica1: string,
    Division_Geografica2: string,
    Ind_Mon: string,
    Lim_Cre: number,
    Lst_Pre: number,
    Nom_Cto: string,
    Num_Tel: string,
    Razonsocial: string,
    Tipo_Contribuyente: string,
}
