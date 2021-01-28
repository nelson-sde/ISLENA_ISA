import { Injectable } from '@angular/core';
import { Cardex } from '../models/cardex';

@Injectable({
  providedIn: 'root'
})
export class IsaCardexService {

  cardex: Cardex[] = [];
  cardexSinSalvar: boolean = false;

  constructor() {}

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

  guardarCardex( cardex: Cardex[] ){                  // Guarda en arreglo en el Local Storage
    let cardexLS: Cardex[] = [];

    if (localStorage.getItem('cardexCliente')){
      cardexLS = JSON.parse( localStorage.getItem('cardexCliente'));
    }
    localStorage.setItem('cardexCliente', JSON.stringify(cardexLS.concat(cardex)));
    this.cardex = [];
  }

}
