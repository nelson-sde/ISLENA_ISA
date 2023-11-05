
import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { Cliente } from 'src/app/models/cliente';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
})
export class ClientesPage {

  texto: string;
  clientes: Cliente[] = [];
  busquedaClientes: Cliente[] = [];
  buscar = ''
  constructor( private isa: IsaService,
               private popoverCtrl: PopoverController,
               private navParams: NavParams ) {
    this.busquedaClientes = this.navParams.get('value');
  }

  dismissClientes( item: Cliente ){             // Retorna el codigo del cliente seleccionado, sino selecciono

    let i = this.clientes.indexOf(item)
    this.isa.clienteAct = this.busquedaClientes[i];
    this.popoverCtrl.dismiss({
      codCliente: this.isa.clienteAct.id
    });
  }
onSearchChange($event){
this.buscar = $event.detail.value;
}
}
