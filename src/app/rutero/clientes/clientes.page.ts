
import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
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

  constructor( private isa: IsaService,
               private popoverCtrl: PopoverController ) {

    this.busquedaClientes = this.isa.buscarClientes.slice(0);
  }

  dismissClientes( i: number ){             // Retorna el codigo del cliente seleccionado, sino selecciono
    this.isa.clienteAct = this.isa.buscarClientes[i];
    this.popoverCtrl.dismiss({
      codCliente: this.isa.clienteAct.id
    });
  }

}
