export class Cliente {
    id: number;
    nombre: string;
    direccion: string;
    montoCredito: number;
    limiteCredito: number;

    constructor(id: number, nombre: string, dir: string, credito: number, limCredito: number ){
        this.id = id;
        this.nombre = nombre;
        this.direccion = dir;
        this.montoCredito = credito;
        this.limiteCredito = limCredito;
    }
}
