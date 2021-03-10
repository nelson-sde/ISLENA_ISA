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

  constructor( public isa: IsaService,
               private isaPedido: IsaPedidoService,
               private router: Router ) {
  }

  configRuta(){
    this.router.navigate(['login',{
      usuario: 'admin',
      navega: 'tab3-config'
    }]);
  }

  cargarDatos(){
    this.router.navigate(['tab3-datos']);
  }

}
