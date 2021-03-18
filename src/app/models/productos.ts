
export class Productos {
    id: string;
    nombre: string;
    listaPrecios: number;
    nivelPrecio: string;
    precio: number;
    moneda: string;
    codigoBarras: string;
    impuesto: string;
    canastaBasica: string;
    imagen: string;
    seleccionado: boolean;
    frio: boolean;

    constructor ( id: string, nombre: string, lstPrc: number, nivelPrecio: string, precio: number, moneda: string, codBar: string, tax: string, canBas: string, img: string,
                  frio: string ){
        this.id = id;
        this.nombre = nombre;
        this.listaPrecios = lstPrc;
        this.nivelPrecio = nivelPrecio;
        this.precio = precio;
        this.moneda = moneda;
        this.codigoBarras = codBar;
        this.impuesto = tax;
        this.canastaBasica = canBas;
        this.imagen = img;
        this.seleccionado = false;
        this.frio = (frio == 'N' ? false : true);
    }
}

export interface ProductosBD {
    cod_Zon: string,
    lst_Pre: number,
    nivel_Precio: string,
    articulo: string,
    precio: number,
    moneda: string,
    des_Art: string,
    cod_Bar: string,
    impuesto: string,
    canasta_Basica: string,
    frio: string,
}
