import { Injectable } from '@angular/core';
import { Cardex } from '../models/cardex';
import { IsaLSService } from './isa-ls.service';
import { IsaService } from './isa.service';

@Injectable({
  providedIn: 'root'
})
export class IsaCardexService {

  cardex: Cardex[] = [];
  cardexSinSalvar: boolean = false;

  constructor( private isa: IsaService,
               private isaLS: IsaLSService ) {}

  agregarCardex(data: Cardex){     // Agrega una linea de producto al arreglo cardex
    this.cardex.push(data);
  }

  cargarCardexCliente( codCliente: string ){
    let cardexCliente: Cardex[] = [];
    let cardex: Cardex[] = [];

    if ( localStorage.getItem('cardexCliente') ){
      cardexCliente = JSON.parse( localStorage.getItem('cardexCliente'));
      cardex = cardexCliente.filter( d => d.codCliente == codCliente && d.aplicado == false);
      if ( cardex == undefined ){
        cardex = [];
      }
    }
    return cardex;
  }

  async cargarCardex( texto: string ){    // 'TODO' indica que se consultarán todos los productos del cliente.  Si TODO se sustituye por un código de producto, filtra por ITEM
    // let cardex: Cardex[] = [];
    let cardex2: Cardex[] = [];
    let consulta: Cardex[] = [];
    let j: number;

    const cardex = await this.isaLS.getHistVentas();
    if ( texto == 'TODO' ){ 
      cardex2 = cardex.filter(d => d.codCliente == this.isa.clienteAct.id);
    } else {
      cardex2 = cardex.filter(d => d.codCliente == this.isa.clienteAct.id && d.codProducto == texto );
    }
    if (cardex2.length > 0){
      for (let i = 0; i < cardex2.length; i++) {
        j = this.isa.productos.findIndex(d => d.id == cardex2[i].codProducto);
        if (j >= 0){
          cardex2[i].desProducto = this.isa.productos[j].nombre;
        }
      }
      consulta = cardex2.sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }
    
    return consulta;
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

  actualizaAplicado( codCliente: string ){
    let cardex: Cardex[] = [];
    if (localStorage.getItem('cardexCliente')){
      cardex = JSON.parse( localStorage.getItem('cardexCliente'));
      cardex.forEach( e => {
        if (e.codCliente == codCliente){
          e.aplicado = true;
        }
      });
      localStorage.setItem('cardexCliente', JSON.stringify(cardex));
    }
    
  }

  guardarCardex( cardex: Cardex[]){                  // Guarda en arreglo en el Local Storage
    let cardexLS: Cardex[] = [];
    let arrayTemp: Cardex[] = [];

    this.isa.addBitacora( true, 'INSERT', `Se inserta en el Cardex, Cliente: ${cardex[0].codCliente}`);

    if (localStorage.getItem('cardexCliente')){
      cardexLS = JSON.parse( localStorage.getItem('cardexCliente'));
      arrayTemp = cardexLS.filter( d => d.codCliente !== this.isa.clienteAct.id && !d.aplicado )
      cardexLS = arrayTemp.concat(cardex);
      localStorage.setItem('cardexCliente', JSON.stringify(cardexLS));
    } else {
      localStorage.setItem('cardexCliente', JSON.stringify(cardex));
    }
  }

  borrarCardex(){
    if (localStorage.getItem('cardexCliente')){
      localStorage.removeItem('cardexCliente');
    }
  }

  borrarLinea( codProducto: string, CodCliente: string ){
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
