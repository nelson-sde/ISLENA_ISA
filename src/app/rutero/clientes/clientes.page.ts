
import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
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
  diaActual = new Date().getDay()-1;
  pedidos = [];
  recibos = [];
  constructor( private isa: IsaService,
               private navParams: NavParams,
               private modalCtrl:ModalController,
               private http:HttpClient,
               private alertasService:AlertasService,
               public alertCtrl:AlertController,
               ) {
this.clientes = this.navParams.get('value');
 
                
    this.busquedaClientes = this.clientes.filter(item => item.dia === this.diaActual);
    this.ordenarPorDiaYOrden(this.busquedaClientes);
 
    this.getPedidosCliente();
  
  }
cargarTodosLosClientes(){
  this.busquedaClientes = this.ordenarPorDiaYOrden(this.clientes);
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
    this.busquedaClientes = await this.ordenarPorDiaYOrden(this.busquedaClientes);
  }

   ordenarPorDiaYOrden(clientes: Cliente[]){
 
    this.alertasService.presentaLoading('Consultando clientes...');
    const diaActual = new Date().getDay() -1;
 if(clientes.length === 0) {
    this.alertasService.loadingDissmiss();
    this.alertasService.message('ISA', 'No hay clientes para mostrar, verifica que hayas sincronizado los datos..')
    return clientes;
 }
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
          case 'todos':
            this.busquedaClientes = this.clientes;
            this.ordenarPorDiaYOrden(this.busquedaClientes);
             break;
          case 'dia':
            this.busquedaClientes =this.clientes.filter(item => item.dia === this.diaActual);
          
           this.ordenarPorDiaYOrden(this.busquedaClientes);
            break;
          case 'recibos':
        this.revisarRecibos();
            break;
          case 'pedidos':
         this.revisarPedidos();
            break;
          default:
            break;
        }
          
        },
      },
    ],
    inputs: [
      {
        label: 'Todos Los Clientes',
        type: 'radio',
        value: 'todos',
      },
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
 
async revisarRecibos(): Promise<Cliente[]> {
  this.alertasService.presentaLoading('Consultando recibos...');
  this.alertasService.loadingDissmiss();
  return this.busquedaClientes.sort((a, b) => {
    const colorValues = { 'success': 3, 'warning': 1, 'secondary': 1 };
      const aValue = colorValues[a.color] || 0;
      const bValue = colorValues[b.color] || 0;
      return bValue - aValue;
  });
}

async revisarPedidos(): Promise<Cliente[]> {
  this.alertasService.presentaLoading('Consultando recibos...');
  this.alertasService.loadingDissmiss();
  return this.busquedaClientes.sort((a, b) => {
    const colorValues = { 'success': 1, 'warning': 3, 'secondary': 3 };
      const aValue = colorValues[a.color] || 0;
      const bValue = colorValues[b.color] || 0;
      return bValue - aValue;
  });
}

async getPedidosCliente(){
  this.pedidos = await this.get(`https://sde1.sderp.site/isa_test/api/Ped_Temp`).toPromise();
  console.log(this.pedidos, 'pedidos')
  for (let i = 0; i < this.pedidos.length; i++) {
    let c = this.busquedaClientes.findIndex(item => item.id === this.pedidos[i].coD_CLT);
    if(c >= 0){
      this.busquedaClientes[c].color = 'success';
    }
   if(i === this.pedidos.length - 1){
    this.getRecibosCliente();
   }
    
  }
}

async getRecibosCliente(){
 this.recibos  = await this.get(`https://sde1.sderp.site/isa_test/api/RecibosTemp`).toPromise();
 console.log(this.recibos, 'recibos')
 for (let recibo of this.recibos) {
  let c = this.busquedaClientes.findIndex(item => item.id === recibo.coD_CLT);
  if(c >= 0){
    if(this.busquedaClientes[c].color  == 'success'){
      this.busquedaClientes[c].color =  'secondary'
    }else if(!this.busquedaClientes[c].color) {
      this.busquedaClientes[c].color =  'warning'
    } 
  }
}
}
get(url: string){
  const URL = url;
  return this.http.get<any[]>( URL );
}

onSearchChange($event){
this.buscar = $event.detail.value;
}
}
