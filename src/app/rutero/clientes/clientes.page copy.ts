
import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { AlertController, ModalController, NavParams, PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Cliente } from 'src/app/models/cliente';
import { AlertasService } from 'src/app/services/alertas.service';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
})
export class ClientesPage {
  @Input() value:any

  texto: string;
  clientes: Cliente[] = [];
  busquedaClientes: Cliente[] = [];
  buscar:string = ''
  diaActual = new Date().getDay();
  constructor( private isa: IsaService,
               private navParams: NavParams,
               private modalCtrl:ModalController,
               private http:HttpClient,
               private alertasService:AlertasService,
               public alertCtrl:AlertController,
               ) {
    this.busquedaClientes = this.ordenarPorDiaYOrden(this.navParams.get('value'));
    console.log(this.busquedaClientes, 'busquedaClientes')
  }

  dismissClientes( item: Cliente ){             // Retorna el codigo del cliente seleccionado, sino selecciono
console.log(item);
console.log(this.isa.clienteAct, 'cliente');
console.log(this.busquedaClientes, 'busquedaClientes')
    let i = this.clientes.findIndex(item => item.id === this.isa.clienteAct.id);
    //this.isa.clienteAct = this.busquedaClientes[i];
    this.isa.clienteAct = item;
    this.modalCtrl.dismiss({
      codCliente: this.isa.clienteAct.id
    });
  }
 async  ordenar(){
    this.busquedaClientes = await this.revisarPedidos(this.busquedaClientes);
  }

   ordenarPorDiaYOrden(clientes: Cliente[]){
    this.alertasService.presentaLoading('Consultando clientes...');
    const diaActual = new Date().getDay();
 
    return clientes.sort((a, b) => {
        const aEsHoy = a.dia === diaActual;
        const bEsHoy = b.dia === diaActual;
        this.alertasService.loadingDissmiss();
        if (aEsHoy !== bEsHoy) {
            return aEsHoy ? -1 : 1;
        }
        return a.orden - b.orden;
    });
}
async opcionesDeFiltro() {
  const alert = await this.alertCtrl.create({
    header: 'Opciones de filtro',
    mode: 'ios',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
           
        },
      },
      {
        text: 'OK',
        role: 'confirm',
        handler: (data) => {
        switch (data) {
          case 'dia':
            this.ordenarPorDiaYOrden(this.busquedaClientes);
            break;
          case 'recibos':
            this.revisarRecibos(this.busquedaClientes);
            break;
          case 'pedidos':
            this.revisarPedidos(this.busquedaClientes);
            break;
          default:
            break;
        }
          
        },
      },
    ],
    inputs: [
      {
        label: 'Ordenar Clientes - Dia',
        type: 'radio',
        value: 'dia',
      },
      {
        label: 'Consultar  Clientes - Recibos',
        type: 'radio',
        value: 'recibos',
      },
      {
        label: 'Consultar Clientes - Pedidos',
        type: 'radio',
        value: 'pedidos',
      },
    ],
  });

  await alert.present();
}


async revisarPedidos(clientes: Cliente[]): Promise<Cliente[]> {
  this.alertasService.presentaLoading('Consultando pedidos...');
  for (let cliente of clientes) {
    cliente.color = await this.getPedidosCliente(cliente.id);
  }
  this.alertasService.loadingDissmiss();
  return clientes.sort((a, b) => {
      if (a.color < b.color) {
          return 1;
      }
      if (a.color > b.color) {
          return -1;
      }
      return 0;
  });
}
async revisarRecibos(clientes: Cliente[]): Promise<Cliente[]> {
  this.alertasService.presentaLoading('Consultando recibos...');
  for (let cliente of clientes) {
    cliente.color = '';
    cliente.color = await this.getRecibosCliente(cliente.id);
  }
  this.alertasService.loadingDissmiss();
  return clientes.sort((a, b) => {
  
      if (a.color < b.color) {
          return 1;
      }
      if (a.color > b.color) {
          return -1;
      }
      return 0;
  });
}
async getPedidosCliente(id: string){
  let recibos:any[] = await this.get(`https://sde1.sderp.site/isa_test/api/get/pedidos/cliente?id=${id}`).toPromise();
  let color = recibos.length > 0 ? 'success' : '';
  return   color;
}

async getRecibosCliente(id: string){
  let recibos:any[] = await this.get(`https://sde1.sderp.site/isa_test/api/get/recibos/cliente?id=${id}`).toPromise();
  let color = recibos.length > 0 ? 'success' : '';
  return   color;
}

get(url: string){
  const URL = url;
  return this.http.get<any[]>( URL );
}

onSearchChange($event){
this.buscar = $event.detail.value;
}
}
