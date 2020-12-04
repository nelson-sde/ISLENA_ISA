import { Injectable } from '@angular/core';
import { Pedido } from '../models/pedido';

@Injectable({
  providedIn: 'root'
})
export class IsaPedidoService {

  pedidos: Pedido[] = [];

  constructor() {}

  cargarPedidos(){
    if (localStorage.getItem('pedidos')){
      this.pedidos = JSON.parse( localStorage.getItem('pedidos'));
    } 
  }

  guardarPedido(){
    localStorage.setItem('pedidos', JSON.stringify(this.pedidos));
  }

  agregarPedido( pedido: Pedido ){
    this.cargarPedidos();
    this.pedidos.push( pedido );
    this.guardarPedido();
  }

}
