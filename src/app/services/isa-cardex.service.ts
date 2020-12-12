import { Injectable } from '@angular/core';
import { Cardex } from '../models/cardex';

@Injectable({
  providedIn: 'root'
})
export class IsaCardexService {

  cardex: Cardex[] = [];

  constructor() {}

  agregarCardex(data: Cardex){     // Agrega una linea de producto al arreglo cardex
    this.cardex.push(data);
  }

                                                // Consulta un id de Producto y devuelve el index en el arreglo, si no lo
  consultarProducto( id: number ): number {      // encuentra devuelve -1
    if (this.cardex.length !== 0 ){           
      const c = this.cardex.findIndex(d => d.codProducto == id);
      return c;
    } else {
      return -1;
    }
  }
                                                      // Modifica una linea en el arreglo del cardex

  modificarCardex( i: number, pedido: number, inventario: number ){
    this.cardex[i].cantPedido = pedido;
    this.cardex[i].cantInventario = inventario;
  }

  guardarCardex(){                  // Guarda en arreglo en la BD
    let cardexBD: Cardex[] = [];

    if (localStorage.getItem('cardex')){
      cardexBD = JSON.parse( localStorage.getItem('cardex'));
    }
    localStorage.setItem('cardex', JSON.stringify(cardexBD.concat(this.cardex)));
    this.cardex = [];
  }

  consultarCliente( id: number ){
    let cardexBD: Cardex[] = [];

    if (localStorage.getItem('cardex')){
      cardexBD = JSON.parse( localStorage.getItem('cardex'));
      const arr = cardexBD.filter(d => (d.codCliente == id && !d.aplicado));
      if (arr.length !== 0){
        this.cardex = arr.slice(0);
      }
    }
  }

}
