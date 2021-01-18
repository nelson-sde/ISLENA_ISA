
export class Productos {
    id: number;
    nombre: string;
    listaPrecios: number;
    precio: number;
    moneda: string;
    codigoBarras: string;
    impuesto: string;
    canastaBasica: string;
    imagen: string;

    constructor ( id: number, nombre: string, lstPrc: number, precio: number, moneda: string, codBar: string, tax: string, canBas: string, img: string){
        this.id = id;
        this.nombre = nombre;
        this.listaPrecios = lstPrc;
        this.precio = precio;
        this.moneda = moneda;
        this.codigoBarras = codBar;
        this.impuesto = tax;
        this.canastaBasica = canBas;
        this.imagen = img;
    }
}

export interface ProductosBD {
    Cod_Zon: string,
    Lst_Pre: number,
    Nivel_Precio: string,
    Articulo: string,
    Precio: number,
    moneda: string,
    Des_Art: string,
    Cod_Bar: string,
    Impuesto: string,
    Canasta_Basica: string
}
