import { Injectable } from '@angular/core';
import { Cardex } from '../models/cardex';

@Injectable({
  providedIn: 'root'
})
export class IsaCardexService {

  cardex: Cardex[] = [];
  cardexSinSalvar: boolean = false;

  constructor() {
    this.cargarCardex();
  }

  agregarCardex(data: Cardex){     // Agrega una linea de producto al arreglo cardex
    this.cardex.push(data);
  }

  cargarCardex(){
    if (localStorage.getItem('cardexCliente')){
      this.cardex = JSON.parse( localStorage.getItem('cardexCliente'));
    }
  }

                                                // Consulta un id de Producto y devuelve el index en el arreglo, si no lo
  consultarProducto( id: string ): number {      // encuentra devuelve -1
    if (this.cardex.length !== 0 ){           
      const c = this.cardex.findIndex(d => d.codProducto == id);
      return c;
    } else {
      return -1;
    }
  }
                                                      // Modifica una linea en el arreglo del cardex

  actualizaAplicado( codCliente: number ){
    this.cardex.forEach( e => {
      if (e.codCliente == codCliente){
        e.aplicado = true;
      }
    })
    localStorage.setItem('cardexCliente', JSON.stringify(this.cardex));
  }

  guardarCardex(){                  // Guarda en arreglo en el Local Storage
    if (localStorage.getItem('cardexCliente')){
      localStorage.setItem('cardexCliente', JSON.stringify(this.cardex));
    }
  }

  borrarLinea( codProducto: string, CodCliente: number ){
    let data: Cardex[] = [];

    const i = this.cardex.findIndex( d => d.codCliente == CodCliente && d.codProducto == codProducto );
    if (i > 0){
      data = this.cardex.slice(0, i);
    } 
    if (i+1 < this.cardex.length){
      data = data.concat(this.cardex.slice(i+1, this.cardex.length));
    }
    this.cardex = data.slice(0);
  }

}
