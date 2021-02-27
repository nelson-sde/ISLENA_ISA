import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Pedido, Pendientes } from '../models/pedido';
import { IsaPedidoService } from '../services/isa-pedido.service';
import { IsaService } from '../services/isa.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})



export class Tab3Page {

  numRuta: string;
  pedidos: Pedido[] = [];
  pendientes: Pendientes [] = [];

  constructor( public isa: IsaService,
               private isaPedido: IsaPedidoService,
               private router: Router ) {

    let pendiente: Pendientes;
    this.numRuta = isa.varConfig.numRuta;
    this.cargarPedidos();
    if ( this.pedidos.length > 0 ){
      for (let i = 0; i < this.pedidos.length; i++) {
        if ( this.pedidos[i].envioExitoso == false ){
          pendiente = new Pendientes( this.pedidos[i].fecha, this.pedidos[i].numPedido, this.pedidos[i].codCliente, false);
          this.pendientes.push(pendiente);
        }
      }
    }
    console.log(this.pendientes);
  }

  configRuta(){
    if (this.isa.varConfig.usuario !== 'admin'){
      // abre el modal de logeo
    }
    if (this.isa.varConfig.usuario == 'admin'){
      console.log('Abrir Config');
      this.router.navigate(['tab3-config']);
    }
  }

  cargarPedidos(){
    if (localStorage.getItem('pedidos')){
      this.pedidos = JSON.parse( localStorage.getItem('pedidos'));
    } 
  }

  transmitir(){
    let pedido: Pedido;

    console.log(this.pendientes);
    for (let i = 0; i < this.pendientes.length; i++) {
      if ( this.pendientes[i].isChecked ){
        pedido = this.pedidos.find(data => data.numPedido = this.pendientes[i].numPedido);
        this.isaPedido.transmitirPedido( pedido, 'R' );
      }
    }
  }

}
